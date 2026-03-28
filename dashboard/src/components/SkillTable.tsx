import type { Skill } from "../types.js";

type Props = {
  skills: Skill[];
  onSelect: (skill: Skill) => void;
};

export default function SkillTable({ skills, onSelect }: Props) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-gray-500 uppercase text-xs">
          <th className="text-left py-3 border-b border-[#2a2a3e] font-medium">
            Name
          </th>
          <th className="text-left py-3 border-b border-[#2a2a3e] font-medium">
            Category
          </th>
          <th className="text-left py-3 border-b border-[#2a2a3e] font-medium">
            Tags
          </th>
          <th className="text-left py-3 border-b border-[#2a2a3e] font-medium">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        {skills.map((skill) => (
          <tr
            key={skill.id}
            className="border-b border-[#1a1a2e] hover:bg-[#1a1a2e] cursor-pointer transition-colors"
            onClick={() => onSelect(skill)}
          >
            <td className="py-3 text-indigo-400">{skill.name}</td>
            <td className="py-3 text-gray-300">{skill.category ?? "—"}</td>
            <td className="py-3">
              <div className="flex gap-1 flex-wrap">
                {(skill.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#2a2a3e] px-2 py-0.5 rounded text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td className="py-3">
              <span
                className={skill.enabled ? "text-green-400" : "text-red-400"}
              >
                ● {skill.enabled ? "enabled" : "disabled"}
              </span>
            </td>
          </tr>
        ))}
        {skills.length === 0 && (
          <tr>
            <td colSpan={4} className="py-8 text-center text-gray-500">
              Nenhuma skill encontrada.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
