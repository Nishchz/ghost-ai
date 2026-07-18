/**
 * Starter template library.
 *
 * Each template defines a complete canvas state (nodes + edges) that can be
 * loaded into the active Liveblocks room, replacing existing content.
 *
 * Templates use the shared canvas schema (types/canvas.ts) so they are fully
 * compatible with user-created content (architecture-context.md invariant 5).
 */

import type { Node, Edge } from "@xyflow/react";
import {
  CANVAS_NODE_TYPE,
  CANVAS_EDGE_TYPE,
  type CanvasNodeData,
  type CanvasEdgeData,
} from "@/types/canvas";

// ---------------------------------------------------------------------------
// CanvasTemplate type
// ---------------------------------------------------------------------------

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node<CanvasNodeData>[];
  edges: Edge<CanvasEdgeData>[];
}

// ---------------------------------------------------------------------------
// Helper — build a node with consistent defaults
// ---------------------------------------------------------------------------

function makeNode(
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  text: string,
  shape: CanvasNodeData["shape"] = "rectangle"
): Node<CanvasNodeData> {
  return {
    id,
    type: CANVAS_NODE_TYPE,
    position: { x, y },
    data: { label, color: fill, textColor: text, shape },
    style: { width, height },
  };
}

// Helper — build an edge
function makeEdge(
  id: string,
  source: string,
  target: string,
  label?: string
): Edge<CanvasEdgeData> {
  return {
    id,
    type: CANVAS_EDGE_TYPE,
    source,
    target,
    data: label ? { label } : {},
  };
}

// ---------------------------------------------------------------------------
// Template 1 — Microservices Architecture
// ---------------------------------------------------------------------------

const microservicesTemplate: CanvasTemplate = {
  id: "microservices",
  name: "Microservices Architecture",
  description:
    "A reference microservices topology with an API gateway, three backend services, a message broker, and shared data stores.",
  nodes: [
    // Client
    makeNode("ms-client", "Web Client", 280, 20, 140, 50, "#10233D", "#52A8FF", "pill"),

    // API Gateway
    makeNode("ms-gateway", "API Gateway", 260, 120, 180, 56, "#2E1938", "#BF7AF0", "rectangle"),

    // Services
    makeNode("ms-user-svc", "User Service", 60, 260, 150, 56, "#0F2E18", "#62C073", "rectangle"),
    makeNode("ms-order-svc", "Order Service", 270, 260, 150, 56, "#331B00", "#FF990A", "rectangle"),
    makeNode("ms-notify-svc", "Notify Service", 480, 260, 150, 56, "#3C1618", "#FF6166", "rectangle"),

    // Message broker
    makeNode("ms-broker", "Message Broker", 270, 380, 150, 50, "#062822", "#0AC7B4", "hexagon"),

    // Databases
    makeNode("ms-user-db", "Users DB", 60, 480, 140, 50, "#1F1F1F", "#EDEDED", "cylinder"),
    makeNode("ms-order-db", "Orders DB", 270, 480, 140, 50, "#1F1F1F", "#EDEDED", "cylinder"),
  ],
  edges: [
    makeEdge("ms-e1", "ms-client", "ms-gateway"),
    makeEdge("ms-e2", "ms-gateway", "ms-user-svc", "auth"),
    makeEdge("ms-e3", "ms-gateway", "ms-order-svc", "orders"),
    makeEdge("ms-e4", "ms-gateway", "ms-notify-svc", "events"),
    makeEdge("ms-e5", "ms-order-svc", "ms-broker", "publish"),
    makeEdge("ms-e6", "ms-broker", "ms-notify-svc", "subscribe"),
    makeEdge("ms-e7", "ms-user-svc", "ms-user-db"),
    makeEdge("ms-e8", "ms-order-svc", "ms-order-db"),
  ],
};

// ---------------------------------------------------------------------------
// Template 2 — CI/CD Pipeline
// ---------------------------------------------------------------------------

const cicdTemplate: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "A continuous integration and delivery pipeline covering source control, build, test, staging, and production deployment stages.",
  nodes: [
    makeNode("ci-repo", "Source Repo", 20, 180, 140, 56, "#10233D", "#52A8FF", "rectangle"),
    makeNode("ci-trigger", "Trigger", 210, 180, 110, 50, "#2E1938", "#BF7AF0", "diamond"),
    makeNode("ci-build", "Build", 370, 100, 120, 56, "#331B00", "#FF990A", "rectangle"),
    makeNode("ci-test", "Test Suite", 370, 200, 120, 56, "#3C1618", "#FF6166", "rectangle"),
    makeNode("ci-lint", "Lint & Scan", 370, 300, 120, 56, "#0F2E18", "#62C073", "rectangle"),
    makeNode("ci-artifact", "Artifact Store", 540, 200, 130, 56, "#062822", "#0AC7B4", "cylinder"),
    makeNode("ci-staging", "Staging Deploy", 720, 120, 130, 56, "#3A1726", "#F75F8F", "pill"),
    makeNode("ci-smoke", "Smoke Tests", 720, 240, 130, 56, "#3C1618", "#FF6166", "rectangle"),
    makeNode("ci-prod", "Production", 900, 180, 130, 60, "#0F2E18", "#62C073", "pill"),
    makeNode("ci-monitor", "Monitoring", 900, 300, 130, 50, "#10233D", "#52A8FF", "hexagon"),
  ],
  edges: [
    makeEdge("ci-e1", "ci-repo", "ci-trigger", "push"),
    makeEdge("ci-e2", "ci-trigger", "ci-build"),
    makeEdge("ci-e3", "ci-trigger", "ci-test"),
    makeEdge("ci-e4", "ci-trigger", "ci-lint"),
    makeEdge("ci-e5", "ci-build", "ci-artifact"),
    makeEdge("ci-e6", "ci-test", "ci-artifact"),
    makeEdge("ci-e7", "ci-artifact", "ci-staging", "deploy"),
    makeEdge("ci-e8", "ci-staging", "ci-smoke"),
    makeEdge("ci-e9", "ci-smoke", "ci-prod", "approve"),
    makeEdge("ci-e10", "ci-prod", "ci-monitor"),
  ],
};

// ---------------------------------------------------------------------------
// Template 3 — Event-Driven System
// ---------------------------------------------------------------------------

const eventDrivenTemplate: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "An event-driven architecture with producers, an event bus, multiple consumer services, and a read-model query layer.",
  nodes: [
    // Producers
    makeNode("ev-web", "Web App", 60, 60, 130, 50, "#10233D", "#52A8FF", "pill"),
    makeNode("ev-mobile", "Mobile App", 60, 160, 130, 50, "#10233D", "#52A8FF", "pill"),
    makeNode("ev-iot", "IoT Device", 60, 260, 130, 50, "#10233D", "#52A8FF", "pill"),

    // Event Bus
    makeNode("ev-bus", "Event Bus", 270, 170, 150, 60, "#062822", "#0AC7B4", "hexagon"),

    // Consumers
    makeNode("ev-billing", "Billing", 490, 60, 140, 56, "#331B00", "#FF990A", "rectangle"),
    makeNode("ev-inventory", "Inventory", 490, 170, 140, 56, "#0F2E18", "#62C073", "rectangle"),
    makeNode("ev-analytics", "Analytics", 490, 280, 140, 56, "#2E1938", "#BF7AF0", "rectangle"),

    // Stores
    makeNode("ev-billing-db", "Billing DB", 680, 60, 130, 50, "#1F1F1F", "#EDEDED", "cylinder"),
    makeNode("ev-inv-db", "Inventory DB", 680, 170, 130, 50, "#1F1F1F", "#EDEDED", "cylinder"),
    makeNode("ev-warehouse", "Data Warehouse", 680, 280, 130, 50, "#1F1F1F", "#EDEDED", "cylinder"),

    // Query Layer
    makeNode("ev-api", "Query API", 870, 170, 130, 56, "#3A1726", "#F75F8F", "rectangle"),
    makeNode("ev-client", "Client", 1040, 170, 110, 50, "#10233D", "#52A8FF", "circle"),
  ],
  edges: [
    makeEdge("ev-e1", "ev-web", "ev-bus", "publish"),
    makeEdge("ev-e2", "ev-mobile", "ev-bus", "publish"),
    makeEdge("ev-e3", "ev-iot", "ev-bus", "publish"),
    makeEdge("ev-e4", "ev-bus", "ev-billing", "subscribe"),
    makeEdge("ev-e5", "ev-bus", "ev-inventory", "subscribe"),
    makeEdge("ev-e6", "ev-bus", "ev-analytics", "subscribe"),
    makeEdge("ev-e7", "ev-billing", "ev-billing-db"),
    makeEdge("ev-e8", "ev-inventory", "ev-inv-db"),
    makeEdge("ev-e9", "ev-analytics", "ev-warehouse"),
    makeEdge("ev-e10", "ev-inv-db", "ev-api", "read"),
    makeEdge("ev-e11", "ev-api", "ev-client"),
  ],
};

// ---------------------------------------------------------------------------
// Exported collection
// ---------------------------------------------------------------------------

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservicesTemplate,
  cicdTemplate,
  eventDrivenTemplate,
];
