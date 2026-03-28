import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import SkillGraph from "../components/SkillGraph.js";
import type { Graph } from "../types.js";

export default function Home() {
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getGraph()
      .then(setGraph)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    skills: graph.nodes.length,
    categories: new Set(graph.nodes.map((n) => n.category).filter(Boolean))
      .size,
    connections: graph.edges.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex justify-between items-center shrink-0">
        <h1 className="text-white text-lg font-semibold">Nexus</h1>
        <div className="flex gap-4 text-sm text-gray-400">
          <div>
            <span className="text-indigo-400 font-bold text-lg mr-1">
              {stats.skills}
            </span>
            skills
          </div>
          <div>
            <span className="text-green-400 font-bold text-lg mr-1">
              {stats.categories}
            </span>
            categorias
          </div>
          <div>
            <span className="text-amber-400 font-bold text-lg mr-1">
              {stats.connections}
            </span>
            conexões
          </div>
        </div>
      </div>
      <div className="flex-1">
        {graph.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Nenhuma skill cadastrada. Crie uma na página Skills.
          </div>
        ) : (
          <SkillGraph graph={graph} />
        )}
      </div>
    </div>
  );
}
