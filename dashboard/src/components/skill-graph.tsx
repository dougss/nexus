import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Graph } from "@/types";

type Props = {
  graph: Graph;
  onNodeClick?: (name: string, position: { x: number; y: number }) => void;
  onPaneClick?: () => void;
};

export function SkillGraph({ graph, onNodeClick, onPaneClick }: Props) {
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
        background: `var(--chart-${getCategoryIndex(node.category)})`,
        color: "white",
        border: "none",
        borderRadius: "var(--radius-xl)",
        padding: "6px 14px",
        fontFamily: "var(--font-sans)",
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
          stroke:
            edge.type === "explicit"
              ? "oklch(0.55 0.22 265 / 50%)"
              : "oklch(0.97 0 0 / 12%)",
          strokeWidth: edge.type === "explicit" ? 2 : 1,
          strokeDasharray: edge.type === "tag" ? "4" : undefined,
        },
        animated: false,
      })),
    [graph.edges],
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const graphNode = graph.nodes.find((n) => n.id === node.id);
      if (graphNode && onNodeClick) {
        onNodeClick(graphNode.name, { x: event.clientX, y: event.clientY });
      }
    },
    [graph.nodes, onNodeClick],
  );

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodeClick={handleNodeClick}
      onPaneClick={onPaneClick}
      onNodesChange={() => {}}
      onEdgesChange={() => {}}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background color="oklch(0.25 0.015 265)" gap={20} />
      <Controls className="[&>button]:bg-card [&>button]:border-border [&>button]:text-foreground" />
    </ReactFlow>
  );
}

function getCategoryIndex(category: string | null): number {
  const map: Record<string, number> = {
    development: 1,
    writing: 2,
    testing: 3,
    devops: 4,
  };
  return map[category ?? ""] ?? 5;
}
