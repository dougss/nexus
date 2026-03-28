import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.js";
import Home from "./pages/Home.js";
import Skills from "./pages/Skills.js";

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skills" element={<Skills />} />
        </Routes>
      </main>
    </div>
  );
}
