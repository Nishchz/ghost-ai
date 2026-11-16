import { task, metadata } from "@trigger.dev/sdk/v3";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const generateSpecPayloadSchema = z.object({
  projectId: z.string().optional(),
  roomId: z.string().min(1, "roomId is required"),
  chatHistory: z.array(z.unknown()).optional().default([]),
  nodes: z.array(z.unknown()).optional().default([]),
  edges: z.array(z.unknown()).optional().default([]),
});

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;

export const generateSpecTask = task({
  id: "generate-spec",
  run: async (payload: GenerateSpecPayload) => {
    // 1. Validate payload using Zod
    const validated = generateSpecPayloadSchema.parse(payload);
    const { projectId, roomId, chatHistory, nodes, edges } = validated;

    console.log(
      `[generate-spec] Starting spec generation task for roomId="${roomId}", projectId="${projectId || "N/A"}"`
    );

    // 2. Set initial metadata status
    metadata.set("status", "generating");
    metadata.set("step", "analyzing_canvas");

    try {
      // 3. Construct system prompt and context for Gemini LLM
      const systemPrompt = `You are Ghost AI, an expert software architect and technical specification author.
Your task is to analyze the provided system architecture canvas (nodes and edges) and chat discussion history, and generate a comprehensive, production-grade technical specification in Markdown format.

The Markdown specification MUST include the following sections:
# Technical Specification: System Architecture

## 1. Executive Summary & Architecture Overview
- High-level design goals, system responsibilities, and key architectural patterns (e.g. Microservices, Event-Driven, Serverless, Monolith).

## 2. Component & Service Breakdown
- Detailed description of each component/node on the canvas, including its shape/role, responsibilities, and technology stack recommendations.

## 3. Data Flow & Integration Points
- Detailed mapping of inter-component communication paths (edges), protocols (e.g. gRPC, REST, WebSocket, Kafka), and data contracts.

## 4. Technical Stack & Infrastructure Recommendations
- Concrete cloud services, frameworks, databases, and middleware to implement the architecture effectively.

## 5. Security, Scalability & Resilience Considerations
- Non-functional requirements including authentication/authorization, caching, load balancing, failover strategies, and data persistence guarantees.

Keep the documentation highly detailed, structured, clear, and ready for engineering teams. Write directly in standard Markdown.`;

      const userContextPrompt = `Context for Spec Generation:

### Room ID: ${roomId}
${projectId ? `### Project ID: ${projectId}` : ""}

### Canvas Architecture Nodes (${nodes.length} nodes):
\`\`\`json
${JSON.stringify(nodes, null, 2)}
\`\`\`

### Canvas Connections / Edges (${edges.length} edges):
\`\`\`json
${JSON.stringify(edges, null, 2)}
\`\`\`

### Chat History (${chatHistory.length} messages):
\`\`\`json
${JSON.stringify(chatHistory, null, 2)}
\`\`\`

Please generate the complete technical specification markdown document based on this architecture.`;

      // 4. Update metadata status
      metadata.set("step", "synthesizing_spec");

      // 5. Call Gemini via AI SDK
      const { text: specContent } = await generateText({
        model: google("gemini-3.5-flash"),
        system: systemPrompt,
        prompt: userContextPrompt,
      });

      // 6. Upload generated spec content to Vercel Blob and store ProjectSpec metadata in Prisma
      if (projectId) {
        try {
          const blob = await put(`specs/${projectId}/${Date.now()}-spec.md`, specContent, {
            access: "private",
            contentType: "text/markdown",
            addRandomSuffix: true,
          });

          const specRecord = await prisma.projectSpec.create({
            data: {
              projectId,
              filePath: blob.url,
            },
          });

          metadata.set("specId", specRecord.id);
          metadata.set("filePath", blob.url);

          console.log(
            `[generate-spec] Saved ProjectSpec (id="${specRecord.id}") to Vercel Blob & Prisma for projectId="${projectId}"`
          );
        } catch (saveErr) {
          console.error(
            `[generate-spec] Failed to save ProjectSpec for projectId="${projectId}":`,
            saveErr
          );
        }
      }

      // 7. Update metadata status to complete
      metadata.set("status", "completed");
      metadata.set("step", "finished");

      console.log(
        `[generate-spec] Successfully generated spec (${specContent.length} chars) for roomId="${roomId}"`
      );

      // Return generated spec content as plain Markdown task output
      return specContent;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Spec generation failed";
      console.error("[generate-spec] Error during execution:", err);

      metadata.set("status", "failed");
      metadata.set("error", errorMessage);

      throw err;
    }
  },
});

// Alias for flexibility
export const generateSpec = generateSpecTask;
