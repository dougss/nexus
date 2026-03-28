import { useState } from "react";
import type { Skill } from "../types.js";

type Props = {
  skill?: Skill | null;
  onSave: (data: {
    name: string;
    displayName: string;
    description: string;
    content: string;
    category?: string;
    tags?: string[];
    model?: string;
    enabled?: boolean;
  }) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export default function SkillForm({
  skill,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const [name, setName] = useState(skill?.name ?? "");
  const [displayName, setDisplayName] = useState(skill?.displayName ?? "");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [content, setContent] = useState(skill?.content ?? "");
  const [category, setCategory] = useState(skill?.category ?? "");
  const [tagsStr, setTagsStr] = useState((skill?.tags ?? []).join(", "));
  const [model, setModel] = useState(skill?.model ?? "");
  const [enabled, setEnabled] = useState(skill?.enabled ?? true);

  const isEdit = !!skill;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      name,
      displayName,
      description,
      content,
      category: category || undefined,
      tags: tags.length > 0 ? tags : undefined,
      model: model || undefined,
      enabled,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#2a2a3e]"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          {isEdit ? `Edit: ${skill.displayName}` : "New Skill"}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Name (slug)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isEdit}
              required
              className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white disabled:opacity-50"
              placeholder="tdd-workflow"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white"
              placeholder="TDD Workflow"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white"
            placeholder="One-line description"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white"
              placeholder="development"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Tags (comma-separated)
            </label>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white"
              placeholder="testing, quality"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white"
              placeholder="optional"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            Content (Markdown)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-white font-mono"
            placeholder="## Steps&#10;1. Write failing test&#10;2. Implement&#10;3. Refactor"
          />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            id="enabled"
            className="accent-indigo-500"
          />
          <label htmlFor="enabled" className="text-sm text-gray-300">
            Enabled
          </label>
        </div>

        <div className="flex justify-between">
          <div>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
