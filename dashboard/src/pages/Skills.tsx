import { useState, useEffect } from "react";
import { Plus, Search, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkillTable } from "@/components/skill-table";
import { SkillForm } from "@/components/skill-form";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/skeleton-loaders";
import type { Skill } from "@/types";

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

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

  async function handleSave(
    data: Parameters<typeof api.createSkill>[0] & { enabled?: boolean },
  ) {
    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.name, data);
        toast.success("Skill updated");
      } else {
        await api.createSkill(data);
        toast.success("Skill created");
      }
      setFormOpen(false);
      setEditingSkill(null);
      loadSkills();
    } catch (err) {
      toast.error(
        editingSkill ? "Failed to update skill" : "Failed to create skill",
      );
    }
  }

  async function handleDelete(skill: Skill) {
    try {
      await api.deleteSkill(skill.name);
      toast.success("Skill deleted");
      setFormOpen(false);
      setEditingSkill(null);
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
          <Button
            size="sm"
            onClick={() => {
              setEditingSkill(null);
              setFormOpen(true);
            }}
          >
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
                      onClick: () => {
                        setEditingSkill(null);
                        setFormOpen(true);
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <SkillTable
              skills={skills}
              onEdit={(skill) => {
                setEditingSkill(skill);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
        </div>
      </ScrollArea>

      <SkillForm
        skill={editingSkill}
        categories={categories}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingSkill(null);
        }}
        onSave={handleSave}
        onDelete={editingSkill ? () => handleDelete(editingSkill) : undefined}
      />
    </div>
  );
}
