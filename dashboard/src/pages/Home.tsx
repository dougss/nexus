import { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import { api } from "@/api/client";
import { SkillGraph } from "@/components/skill-graph";
import { SkillDetailSheet } from "@/components/skill-detail-sheet";
import { StatBadge } from "@/components/stat-badge";
import { EmptyState } from "@/components/empty-state";
import { GraphSkeleton } from "@/components/skeleton-loaders";
import type { Graph, Skill } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getGraph()
      .then(setGraph)
      .finally(() => setLoading(false));
  }, []);

  async function handleNodeClick(name: string) {
    const skill = await api.getSkill(name);
    setSelectedSkill(skill);
    setSheetOpen(true);
  }

  const stats = {
    skills: graph.nodes.length,
    categories: new Set(graph.nodes.map((n) => n.category).filter(Boolean))
      .size,
    connections: graph.edges.length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between border-b border-border px-5 py-3">
        <h1 className="text-lg font-semibold text-foreground">Nexus</h1>
        <div className="flex gap-6">
          <StatBadge value={stats.skills} label="skills" color="primary" />
          <StatBadge
            value={stats.categories}
            label="categories"
            color="success"
          />
          <StatBadge
            value={stats.connections}
            label="connections"
            color="warning"
          />
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <GraphSkeleton />
        ) : graph.nodes.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No skills yet"
            description="Create your first skill to see the graph."
            action={{
              label: "Create Skill",
              onClick: () => navigate("/skills"),
            }}
          />
        ) : (
          <SkillGraph graph={graph} onNodeClick={handleNodeClick} />
        )}
      </div>

      <SkillDetailSheet
        skill={selectedSkill}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
