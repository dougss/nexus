import { Routes, Route } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Skills from "@/pages/Skills";
import SkillDetail from "@/pages/SkillDetail";

export default function App() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 md:hidden">
            <SidebarTrigger />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/skills/new" element={<SkillDetail />} />
            <Route path="/skills/:name" element={<SkillDetail />} />
          </Routes>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  );
}
