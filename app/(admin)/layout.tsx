"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  Car,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "./logout/actions";

const sidebarItems = [
  {
    title: "仪表盘",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "机场管理",
    href: "/admin/airports",
    icon: Plane,
  },
  {
    title: "停车场管理",
    href: "/admin/parking",
    icon: Car,
  },
  {
    title: "设置",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                管理后台
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="关闭侧边栏"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-violet-400" : ""}`} />
                  {item.title}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-red-400 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                退出登录
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="h-16 flex items-center gap-4 px-4 sm:px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="打开侧边栏"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page title */}
          <div className="flex-1">
            <span className="text-sm text-muted-foreground">AirportMatrix 管理后台</span>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* 移动端遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
