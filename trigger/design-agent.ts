import { task } from "@trigger.dev/sdk/v3";
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";
import { getLiveblocksClient } from "@/lib/liveblocks";
import { LiveObject, LiveMap } from "@liveblocks/node";
import {
    CANVAS_NODE_TYPE,
    CANVAS_EDGE_TYPE,
    NODE_COLORS,
} from "@/types/canvas";

// ---------------------------------------------------------------------------
// Action Tools & Schemas for Gemini LLM
// ---------------------------------------------------------------------------

const NodeShapeEnum = z.enum([
    "rectangle",
    "diamond",
    "circle",
    "pill",
    "cylinder",
    "hexagon",
]);

const designTools = {
    addNode: tool({
        description: "Add a new node component to the canvas architecture layout.",
        inputSchema: z.object({
            id: z.string().describe("Unique node identifier e.g. node-1"),
            label: z.string().describe("Text label displayed inside the node"),
            shape: NodeShapeEnum.default("rectangle"),
            color: z
                .string()
                .optional()
                .describe(
                    "Fill color hex e.g. #1F1F1F (Neutral), #10233D (Blue), #2E1938 (Purple), #331B00 (Orange), #3C1618 (Red), #3A1726 (Pink), #0F2E18 (Green), #062822 (Teal)"
                ),
            textColor: z
                .string()
                .optional()
                .describe("Contrasting text color hex matching the fill color palette"),
            position: z.object({
                x: z.number().describe("X coordinate on canvas"),
                y: z.number().describe("Y coordinate on canvas"),
            }),
            style: z
                .object({
                    width: z.number().default(160),
                    height: z.number().default(80),
                })
                .optional(),
        }),
    }),
    moveNode: tool({
        description: "Move an existing node to a new position on the canvas.",
        inputSchema: z.object({
            id: z.string().describe("ID of the node to move"),
            position: z.object({
                x: z.number().describe("New X coordinate on canvas"),
                y: z.number().describe("New Y coordinate on canvas"),
            }),
        }),
    }),
    resizeNode: tool({
        description: "Resize an existing node on the canvas.",
        inputSchema: z.object({
            id: z.string().describe("ID of the node to resize"),
            style: z.object({
                width: z.number().describe("New width in pixels"),
                height: z.number().describe("New height in pixels"),
            }),
        }),
    }),
    updateNodeData: tool({
        description: "Update properties of an existing node (label, shape, color, textColor).",
        inputSchema: z.object({
            id: z.string().describe("ID of the node to update"),
            label: z.string().optional().describe("New text label"),
            shape: NodeShapeEnum.optional().describe("New shape"),
            color: z.string().optional().describe("New fill color hex"),
            textColor: z.string().optional().describe("New text color hex"),
        }),
    }),
    deleteNode: tool({
        description: "Delete a node and its connected edges from the canvas.",
        inputSchema: z.object({
            id: z.string().describe("ID of the node to delete"),
        }),
    }),
    addEdge: tool({
        description: "Add a directional connecting edge between two nodes.",
        inputSchema: z.object({
            id: z.string().describe("Unique edge identifier e.g. edge-1"),
            source: z.string().describe("ID of the source node"),
            target: z.string().describe("ID of the target node"),
            label: z.string().optional().describe("Optional edge label text"),
        }),
    }),
    deleteEdge: tool({
        description: "Delete an edge from the canvas.",
        inputSchema: z.object({
            id: z.string().describe("ID of the edge to delete"),
        }),
    }),
};

// ---------------------------------------------------------------------------
// AI Presence Helper
// ---------------------------------------------------------------------------

const AI_USER_ID = "ghost-ai-agent";
const AI_USER_INFO = {
    name: "Ghost AI",
    avatar: "",
    color: "#6457f9", // AI accent color
};

async function updateAiPresence(
    roomId: string,
    presence: {
        cursor?: { x: number; y: number } | null;
        isThinking: boolean;
        statusText?: string;
    }
) {
    try {
        const liveblocks = getLiveblocksClient();
        await liveblocks.setPresence(roomId, {
            userId: AI_USER_ID,
            userInfo: AI_USER_INFO,
            data: {
                cursor: presence.cursor ?? null,
                isThinking: presence.isThinking,
                thinking: presence.isThinking,
                statusText: presence.statusText || "",
            },
            ttl: 60, // Auto-expires after 60 seconds
        });
    } catch (err) {
        console.warn("[design-agent] Failed to set AI presence:", err);
    }
}

// ---------------------------------------------------------------------------
// Trigger.dev Design Agent Task
// ---------------------------------------------------------------------------

export const designAgentTask = task({
    id: "design-agent",
    run: async (payload: { prompt: string; roomId: string }) => {
        const { prompt, roomId } = payload;
        console.log(
            `[design-agent] Starting design task for roomId="${roomId}", prompt="${prompt}"`
        );

        // 1. Set initial AI presence (Start phase)
        await updateAiPresence(roomId, {
            isThinking: true,
            cursor: { x: 400, y: 300 },
            statusText: "Analyzing system prompt...",
        });

        try {
            // 2. Fetch current room storage document to inspect existing nodes and edges
            const liveblocks = getLiveblocksClient();
            let currentGraph = { nodes: [], edges: [] };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawDoc = (await liveblocks.getStorageDocument(roomId, "json")) as any;
                if (rawDoc?.flow) {
                    const rawNodes = rawDoc.flow.nodes || {};
                    const rawEdges = rawDoc.flow.edges || {};
                    currentGraph = {
                        nodes: Object.values(rawNodes),
                        edges: Object.values(rawEdges),
                    };
                }
            } catch (docErr) {
                console.warn(
                    "[design-agent] Could not fetch existing room storage document, starting clean:",
                    docErr
                );
            }

            // 3. Construct system prompt for Gemini
            const systemPrompt = `You are Ghost AI, an expert system architect and collaborative canvas design assistant.
Your goal is to interpret the user's system design request and call the appropriate canvas tools (addNode, moveNode, resizeNode, updateNodeData, deleteNode, addEdge, deleteEdge) to update the architecture canvas.

Allowed Node Shapes:
- "rectangle": General system components / services
- "diamond": Decision points / Load balancers / Gateways
- "circle": Endpoints / Events / Triggers
- "pill": Core services / Applications
- "cylinder": Databases / Caches / Persistent Storage
- "hexagon": External APIs / Third-party systems

Node Color Palette (Fill / Text):
- #1F1F1F / #EDEDED (Neutral dark - default)
- #10233D / #52A8FF (Blue)
- #2E1938 / #BF7AF0 (Purple)
- #331B00 / #FF990A (Orange)
- #3C1618 / #FF6166 (Red)
- #3A1726 / #F75F8F (Pink)
- #0F2E18 / #62C073 (Green)
- #062822 / #0AC7B4 (Teal)

Layout & Spacing Guidelines:
1. Space nodes logically so they do not overlap (200-250px horizontal gap, 120-150px vertical gap).
2. Choose appropriate shapes based on component roles.
3. Choose contrasting colors from the palette to group components visually.
4. Ensure edges reference existing source and target node IDs.
5. Standard node sizes: width 160-220px, height 80-100px.

Execute tools to add all required nodes and edges for the user request.

Response Summary Format Guidelines:
Your text response MUST provide a structured output formatted with two clear sections (do NOT use double asterisks ** around headings):
1. Implementation Summary: (approx. 5 lines): Provide a comprehensive breakdown of the architectural nodes, shapes, colors, and data flows added or updated on the canvas to fulfill the prompt.
2. Suggested Improvements: (approx. 2 lines): Highlight 1-2 actionable future enhancements, scalability optimizations, or security additions for this architecture.

Current Canvas State:
${JSON.stringify(currentGraph, null, 2)}`;

            // 4. Update presence (Processing phase)
            await updateAiPresence(roomId, {
                isThinking: true,
                cursor: { x: 450, y: 350 },
                statusText: "Generating architecture layout...",
            });

            // Call Gemini via AI SDK using generateText and design tools
            const { text, toolCalls } = await generateText({
                model: google("gemini-3.5-flash"),
                system: systemPrompt,
                prompt: prompt,
                tools: designTools,
            });

            console.log(
                `[design-agent] Gemini generated ${toolCalls.length} tool call(s). Text summary: "${text}"`
            );

            // 5. Update presence (Mutation phase)
            await updateAiPresence(roomId, {
                isThinking: true,
                cursor: { x: 500, y: 400 },
                statusText: "Applying graph updates to canvas...",
            });

            // 6. Execute room storage mutations transactionally via Liveblocks
            await liveblocks.mutateStorage(roomId, ({ root }) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rootObj = root as any;
                let flow = rootObj.get("flow") as LiveObject<any>;
                if (!flow) {
                    flow = new LiveObject({
                        nodes: new LiveMap(),
                        edges: new LiveMap(),
                    });
                    rootObj.set("flow", flow);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let nodesMap = flow.get("nodes") as LiveMap<string, LiveObject<any>>;
                if (!nodesMap) {
                    nodesMap = new LiveMap();
                    flow.set("nodes", nodesMap);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let edgesMap = flow.get("edges") as LiveMap<string, LiveObject<any>>;
                if (!edgesMap) {
                    edgesMap = new LiveMap();
                    flow.set("edges", edgesMap);
                }

                for (const call of toolCalls) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const input = (call as any).input || (call as any).args || {};
                    switch (call.toolName) {
                        case "addNode": {
                            const { id, label, shape, color, textColor, position, style } = input;
                            const matchedColor =
                                NODE_COLORS.find(
                                    (c) => c.fill.toLowerCase() === (color || "").toLowerCase()
                                ) || NODE_COLORS[0];

                            const newNode = new LiveObject({
                                id,
                                type: CANVAS_NODE_TYPE,
                                position,
                                data: new LiveObject({
                                    label,
                                    color: color || matchedColor.fill,
                                    textColor: textColor || matchedColor.text,
                                    shape: shape || "rectangle",
                                }),
                                style: style || { width: 160, height: 80 },
                                measured: {
                                    width: style?.width || 160,
                                    height: style?.height || 80,
                                },
                                selected: false,
                                dragging: false,
                                resizing: false,
                            });
                            nodesMap.set(id, newNode);
                            break;
                        }

                        case "moveNode": {
                            const { id, position } = input;
                            const existingNode = nodesMap.get(id);
                            if (existingNode) {
                                existingNode.set("position", position);
                            }
                            break;
                        }

                        case "resizeNode": {
                            const { id, style } = input;
                            const existingNode = nodesMap.get(id);
                            if (existingNode) {
                                existingNode.set("style", style);
                                existingNode.set("measured", style);
                            }
                            break;
                        }

                        case "updateNodeData": {
                            const { id, label, shape, color, textColor } = input;
                            const existingNode = nodesMap.get(id);
                            if (existingNode) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const dataObj = existingNode.get("data") as LiveObject<any>;
                                if (dataObj) {
                                    if (label !== undefined) dataObj.set("label", label);
                                    if (shape !== undefined) dataObj.set("shape", shape);
                                    if (color !== undefined) dataObj.set("color", color);
                                    if (textColor !== undefined) dataObj.set("textColor", textColor);
                                }
                            }
                            break;
                        }

                        case "deleteNode": {
                            const { id } = input;
                            nodesMap.delete(id);
                            // Clean up connected edges
                            for (const [edgeId, edgeObj] of Array.from(edgesMap.entries())) {
                                const source = edgeObj.get("source");
                                const target = edgeObj.get("target");
                                if (source === id || target === id) {
                                    edgesMap.delete(edgeId);
                                }
                            }
                            break;
                        }

                        case "addEdge": {
                            const { id, source, target, label } = input;
                            const newEdge = new LiveObject({
                                id,
                                source,
                                target,
                                type: CANVAS_EDGE_TYPE,
                                data: label ? new LiveObject({ label }) : undefined,
                                selected: false,
                            });
                            edgesMap.set(id, newEdge);
                            break;
                        }

                        case "deleteEdge": {
                            const { id } = input;
                            edgesMap.delete(id);
                            break;
                        }
                    }
                }
            });

            // 7. Update presence (Synthesis phase)
            await updateAiPresence(roomId, {
                isThinking: true,
                cursor: { x: 550, y: 450 },
                statusText: "Synthesizing architectural breakdown...",
            });

            // 8. Generate rich architectural breakdown response text
            let finalSummary = text;
            if (!finalSummary || finalSummary.trim().length === 0 || finalSummary.includes("Executed")) {
                const executedActionsSummary = toolCalls
                    .map((call) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const args = (call as any).input || (call as any).args || {};
                        if (call.toolName === "addNode") {
                            return `- Added Node [${args.id}]: "${args.label}" (Shape: ${args.shape || "rectangle"})`;
                        } else if (call.toolName === "addEdge") {
                            return `- Connected Edge [${args.id}]: From "${args.source}" to "${args.target}"${args.label ? ` (${args.label})` : ""}`;
                        } else if (call.toolName === "updateNodeData") {
                            return `- Updated Node [${args.id}]: ${args.label ? `Label="${args.label}"` : ""} ${args.shape ? `Shape="${args.shape}"` : ""}`;
                        } else if (call.toolName === "deleteNode") {
                            return `- Deleted Node [${args.id}]`;
                        } else if (call.toolName === "deleteEdge") {
                            return `- Deleted Edge [${args.id}]`;
                        }
                        return `- Executed action: ${call.toolName}`;
                    })
                    .join("\n");

                const synthesisPrompt = `The user requested: "${prompt}"

You have successfully rendered/updated the architecture layout on the canvas with the following actions:
${executedActionsSummary || "Executed canvas layout actions."}

CRITICAL REQUIREMENT: Keep your response concise (TOTAL LENGTH MUST BE 5 TO 6 LINES MAXIMUM).
Format as clean Markdown with two brief sections:

**Implementation Summary** (~4 lines): Briefly summarize the architecture pattern (e.g., Microservices, Event-Driven), main services deployed, and end-to-end data flow.
**Suggested Improvements** (~2 lines): 1-2 quick actionable scalability, caching, or security recommendations.`;

                const synthesisResult = await generateText({
                    model: google("gemini-3.5-flash"),
                    prompt: synthesisPrompt,
                });
                finalSummary = synthesisResult.text;
            }

            // 9. Completion: update presence and clear thinking
            await updateAiPresence(roomId, {
                isThinking: false,
                cursor: null,
                statusText: "Complete",
            });

            return {
                success: true,
                summary: finalSummary || `Executed ${toolCalls.length} canvas actions.`,
                actionsCount: toolCalls.length,
            };
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to generate design";
            console.error("[design-agent] Error during execution:", err);

            // Handle errors gracefully & clear AI presence
            await updateAiPresence(roomId, {
                isThinking: false,
                cursor: null,
                statusText: `Error: ${errorMessage}`,
            });

            throw err;
        }
    },
});