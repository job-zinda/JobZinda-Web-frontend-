"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { name: "Jobs", href: "/feed", icon: "work" },
  { name: "Nearby Freelancers", href: "/freelancers", icon: "location_on" },
  { name: "Profile", href: "/profile", icon: "person" },
  { name: "Subscription", href: "/subscription", icon: "loyalty" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FEF7FE]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7230E6] border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#FEF7FE] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white/70 backdrop-blur-xl flex-col py-8 border-r border-[#7230E6]/5 z-40 fixed left-0 top-0 bottom-0 h-full">
        <div className="px-7 mb-10">
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <span className="text-xl font-black text-[#7230E6] tracking-tighter">Job Zinda</span>
          </Link>
        </div>

        <nav className="flex-grow flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "text-[#7230E6] bg-[#7230E6]/8 shadow-sm"
                    : "text-slate-500 hover:text-[#7230E6] hover:bg-[#7230E6]/5"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrap */}
      <div className="flex-grow md:ml-64 flex flex-col h-full">
        {/* Topbar */}
        <header className="flex justify-between items-center h-16 px-6 md:px-8 w-full bg-white/70 backdrop-blur-xl border-b border-[#7230E6]/5 sticky top-0 z-50 flex-shrink-0">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link href="/feed" className="flex items-center gap-2">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
              </div>
              <span className="text-lg font-black text-[#7230E6] tracking-tighter">Job Zinda</span>
            </Link>
          </div>

          {/* Page title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {navItems.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"))?.name || "Dashboard"}
            </h2>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-[#7230E6]/5 hover:text-[#7230E6] transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <Link href="/profile" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-[#7230E6]/15 group-hover:border-[#7230E6]/40 transition-all shadow-sm">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl as string} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[#7230E6]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#7230E6] text-lg">person</span>
                  </div>
                )}
              </div>
              {user?.username && (
                <span className="hidden lg:block text-sm font-semibold text-slate-700 group-hover:text-[#7230E6] transition-colors">
                  {user.username}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto relative h-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-[#7230E6]/5 px-2 py-2 flex justify-around items-center z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                  isActive ? "text-[#7230E6]" : "text-slate-400"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
