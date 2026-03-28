export type Skill = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string | null;
  tags: string[];
  content: string;
  inputSchema: unknown;
  model: string | null;
  enabled: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type GraphNode = {
  id: string;
  name: string;
  displayName: string;
  category: string | null;
  tags: string[];
  enabled: boolean;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "explicit" | "tag";
  relationType?: string;
  sharedTag?: string;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
