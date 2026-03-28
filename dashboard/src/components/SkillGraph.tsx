import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Graph } from "../types.js";

const CATEGORY_COLORS: Record<string, string> = {
  development: "#6366f1",
  writing: "#22c55e",
  testing: "#f59e0b",
  devops: "#ef4444",
  default: "#8b5cf6",
};

function getCategoryColor(category: string | null): string {
  return CATEGORY_COLORS[category ?? ""] ?? CATEGORY_COLORS.default;
}

type Props = {
  graph: Graph;
  onNodeClick?: (name: string) => void;
};

export default function SkillGraph({ graph, onNodeClick }: Props) {
  const flowNodes: Node[] = useMemo(() => {
    const angleStep = (2 * Math.PI) / Math.max(graph.nodes.length, 1);
    const radius = Math.max(200, graph.nodes.length * 30);

    return graph.nodes.map((node, i) => ({
      id: node.id,
      position: {
        x: Math.cos(angleStep * i) * radius + radius + 100,
        y: Math.sin(angleStep * i) * radius + radius + 100,
      },
      data: { label: node.displayName },
      style: {
        background: getCategoryColor(node.category),
        color: "white",
        border: "none",
        borderRadius: "20px",
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: 500,
        opacity: node.enabled ? 1 : 0.5,
        cursor: "pointer",
      },
    }));
  }, [graph.nodes]);

  const flowEdges: Edge[] = useMemo(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        style: {
          stroke: edge.type === "explicit" ? "#6366f180" : "#ffffff20",
          strokeWidth: edge.type === "explicit" ? 2 : 1,
          strokeDasharray: edge.type === "tag" ? "4" : undefined,
        },
        animated: false,
      })),
    [graph.edges],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = graph.nodes.find((n) => n.id === node.id);
      if (graphNode && onNodeClick) onNodeClick(graphNode.name);
    },
    [graph.nodes, onNodeClick],
  );

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodeClick={handleNodeClick}
      onNodesChange={() => {}}
      onEdgesChange={() => {}}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#2a2a3e" gap={20} />
      <Controls style={{ background: "#1a1a2e", borderColor: "#2a2a3e" }} />
    </ReactFlow>
  );
}
