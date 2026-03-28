import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: "\u{1F3E0}", label: "Home" },
  { to: "/skills", icon: "\u26A1", label: "Skills" },
];

export default function Sidebar() {
  return (
    <nav className="w-[60px] bg-[#1a1a2e] border-r border-[#2a2a3e] flex flex-col items-center pt-4 gap-5 shrink-0">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors ${
              isActive ? "bg-indigo-500" : "bg-[#2a2a3e] hover:bg-[#3a3a4e]"
            }`
          }
          title={item.label}
        >
          {item.icon}
        </NavLink>
      ))}
      <div className="flex-1" />
      <div
        className="w-9 h-9 rounded-lg bg-[#2a2a3e] flex items-center justify-center text-sm mb-4 opacity-50 cursor-not-allowed"
        title="Settings (soon)"
      >
        {"\u2699\uFE0F"}
      </div>
    </nav>
  );
}
