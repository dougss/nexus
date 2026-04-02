import { Home, Zap, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/skills", icon: Zap, label: "Skills" },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        {/* Expanded: logo + name */}
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <img
            src="/android-chrome-192x192.png"
            alt="Nexus"
            className="size-9 rounded-xl shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-base font-semibold text-sidebar-primary">
              Nexus
            </span>
            <span className="text-xs text-muted-foreground">
              Skills Registry
            </span>
          </div>
        </div>
        {/* Collapsed: icon only */}
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <img
            src="/favicon-32x32.png"
            alt="Nexus"
            className="size-6 rounded-md"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <NavLink to={item.to} end={item.to === "/"}>
                    {({ isActive }) => (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive}
                            className="cursor-pointer"
                          >
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="group-data-[collapsible=icon]:block hidden"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton disabled className="opacity-50">
                  <Settings className="size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">Coming soon</TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
