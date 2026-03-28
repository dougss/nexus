import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import SkillTable from "../components/SkillTable.js";
import SkillForm from "../components/SkillForm.js";
import type { Skill } from "../types.js";

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  async function loadSkills() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    const [skillsData, cats] = await Promise.all([
      api.listSkills(params),
      api.getCategories(),
    ]);
    setSkills(skillsData);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    loadSkills();
  }, [activeCategory, search]);

  async function handleSave(
    data: Parameters<typeof api.createSkill>[0] & { enabled?: boolean },
  ) {
    if (editingSkill) {
      await api.updateSkill(editingSkill.name, data);
    } else {
      await api.createSkill(data);
    }
    setShowForm(false);
    setEditingSkill(null);
    loadSkills();
  }

  async function handleDelete() {
    if (editingSkill) {
      await api.deleteSkill(editingSkill.name);
      setShowForm(false);
      setEditingSkill(null);
      loadSkills();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex justify-between items-center shrink-0">
        <h1 className="text-white text-lg font-semibold">Skills</h1>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-[#2a2a3e] px-3 py-1.5 rounded-lg text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              setEditingSkill(null);
              setShowForm(true);
            }}
            className="bg-indigo-500 px-3 py-1.5 rounded-lg text-sm text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            + New Skill
          </button>
        </div>
      </div>

      <div className="px-5 py-2 flex gap-2 border-b border-[#1a1a2e] shrink-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            !activeCategory
              ? "bg-indigo-500 text-white"
              : "bg-[#2a2a3e] text-gray-400 hover:text-white"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              activeCategory === cat
                ? "bg-indigo-500 text-white"
                : "bg-[#2a2a3e] text-gray-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        ) : (
          <SkillTable
            skills={skills}
            onSelect={(skill) => {
              setEditingSkill(skill);
              setShowForm(true);
            }}
          />
        )}
      </div>

      {showForm && (
        <SkillForm
          skill={editingSkill}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingSkill(null);
          }}
          onDelete={editingSkill ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
