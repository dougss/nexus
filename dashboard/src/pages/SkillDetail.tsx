import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Skill } from "@/types";

export default function SkillDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const isNew = !name;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [model, setModel] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(() => {});

    if (name) {
      setLoading(true);
      api
        .getSkill(name)
        .then((s) => {
          setSkill(s);
          setFormName(s.name);
          setDisplayName(s.displayName);
          setDescription(s.description);
          setContent(s.content);
          setCategory(s.category ?? "");
          setTagsStr((s.tags ?? []).join(", "));
          setModel(s.model ?? "");
          setEnabled(s.enabled);
        })
        .catch(() => {
          toast.error("Skill not found");
          navigate("/skills");
        })
        .finally(() => setLoading(false));
    }
  }, [name, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data = {
      name: formName,
      displayName,
      description,
      content,
      category: category || undefined,
      tags: tags.length > 0 ? tags : undefined,
      model: model || undefined,
      enabled,
    };

    try {
      if (skill) {
        await api.updateSkill(skill.name, data);
        toast.success("Skill updated");
      } else {
        await api.createSkill(data);
        toast.success("Skill created");
        navigate(`/skills/${formName}`);
      }
    } catch (err) {
      toast.error(skill ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!skill) return;
    try {
      await api.deleteSkill(skill.name);
      toast.success("Skill deleted");
      navigate("/skills");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 flex items-center gap-3 border-b border-border px-5 py-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/skills")}
            className="size-8"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isNew ? "New Skill" : (skill?.displayName ?? name)}
          </h1>
          {skill && (
            <Badge variant={skill.enabled ? "default" : "destructive"}>
              {skill.enabled ? "enabled" : "disabled"}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {skill && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1 size-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1">
        <form onSubmit={handleSave} className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Identity */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Identity
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (slug)</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={!!skill}
                  required
                  placeholder="tdd-workflow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="TDD Workflow"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="One-line description"
              />
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Metadata
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="testing, quality"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="optional"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                id="enabled"
                checked={enabled}
                onCheckedChange={(checked) => setEnabled(checked === true)}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Content
            </h2>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="font-mono text-sm"
              placeholder={
                "## Steps\n1. Write failing test\n2. Implement\n3. Refactor"
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/skills")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : skill ? "Save Changes" : "Create Skill"}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
