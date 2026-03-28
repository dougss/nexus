import { useState, useEffect } from "react";
import { Plus, Search, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkillTable } from "@/components/skill-table";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/skeleton-loaders";
import type { Skill } from "@/types";

export default function Skills() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSkills() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeCategory) params.category = activeCategory;
      if (search) params.search = search;
      const [skillsData, cats] = await Promise.all([
        api.listSkills(params),
        api.getCategories(),
      ]);
      setSkills(skillsData);
      setCategories(cats);
    } catch (err) {
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, [activeCategory, search]);

  async function handleDelete(skill: Skill) {
    try {
      await api.deleteSkill(skill.name);
      toast.success("Skill deleted");
      loadSkills();
    } catch (err) {
      toast.error("Failed to delete skill");
    }
  }

  async function handleToggle(skill: Skill) {
    try {
      await api.updateSkill(skill.name, { enabled: !skill.enabled } as any);
      toast.success(`Skill ${skill.enabled ? "disabled" : "enabled"}`);
      loadSkills();
    } catch (err) {
      toast.error("Failed to toggle skill");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between border-b border-border px-5 py-3">
        <h1 className="text-lg font-semibold text-foreground">Skills</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 w-48"
            />
          </div>
          <Button size="sm" onClick={() => navigate("/skills/new")}>
            <Plus className="mr-1 size-4" />
            New Skill
          </Button>
        </div>
      </div>

      <div className="shrink-0 flex gap-2 border-b border-border px-5 py-2">
        <Badge
          variant={!activeCategory ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => setActiveCategory(null)}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={activeCategory === cat ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5">
          {loading ? (
            <TableSkeleton />
          ) : skills.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No skills found"
              description={
                search
                  ? "Try a different search term."
                  : "Create your first skill."
              }
              action={
                !search
                  ? {
                      label: "Create Skill",
                      onClick: () => navigate("/skills/new"),
                    }
                  : undefined
              }
            />
          ) : (
            <SkillTable
              skills={skills}
              onEdit={(skill) => navigate(`/skills/${skill.name}`)}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
