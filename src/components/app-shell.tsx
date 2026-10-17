"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { chatApi, notificationApi } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";
import { SUPPORT } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/dialog";
import { AppBanner } from "@/components/app-promo";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  auth?: boolean;
  hidden?: boolean;
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function useUnreadCounts() {
  const { isAuthenticated } = useAuth();
  const notifications = useQuery({
    queryKey: ["notification-count"],
    queryFn: notificationApi.count,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
  const chat = useQuery({
    queryKey: ["chat-unread"],
    queryFn: async () => {
      const [primary, support] = await Promise.all([
        chatApi.unreadCount().catch(() => 0),
        chatApi.supportUnreadCount().catch(() => 0),
      ]);
      return { primary, support, total: primary + support };
    },
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
  return { notifications: notifications.data ?? 0, chat: chat.data?.total ?? 0, chatDetail: chat.data };
}

function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
        active ? "bg-primary/8 text-primary shadow-sm" : "text-on-surface-variant hover:bg-primary/5 hover:text-primary",
      )}
    >
      <Icon name={item.icon} filled={active} className="text-[22px]" />
      <span className="flex-1">{item.label}</span>
      {!!item.badge && (
        <span className="min-w-5 rounded-full bg-error px-1.5 text-center text-[10px] font-bold leading-5 text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <img src="/logo.png" alt="" className="h-9 w-9 rounded-xl object-cover shadow-md shadow-primary/20" />
      <span className="whitespace-nowrap font-headline text-xl font-black tracking-tighter text-primary">Job Zinda</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isNormalAccount, isPromoter, logout, requireAuth } = useAuth();
  const counts = useUnreadCounts();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  // Full-height pages (map, chat) manage their own scrolling.
  const fullBleed = pathname === "/map" || isActive(pathname, "/chat");

  useEffect(() => {
    // Close the mobile drawer on navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  const main: NavItem[] = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Search", href: "/search", icon: "search" },
    { label: "Nearby", href: "/map", icon: "location_on" },
    { label: "Messages", href: "/chat", icon: "chat", badge: counts.chat, auth: true },
    { label: "Notifications", href: "/notifications", icon: "notifications", badge: counts.notifications, auth: true },
    { label: "Profile", href: "/profile", icon: "person", auth: true },
  ];
  const more: NavItem[] = [
    { label: "Plans", href: "/plans", icon: "workspace_premium", auth: true },
    { label: "Plans for you", href: "/plans-for-you", icon: "campaign", auth: true },
    { label: "Jobs", href: "/jobs", icon: "work", auth: true },
    { label: "Wallet", href: "/wallet", icon: "account_balance_wallet", auth: true },
    { label: "Referrals", href: "/referrals", icon: "group_add", auth: true, hidden: isNormalAccount },
    { label: "Courses", href: "/course", icon: "school", auth: true },
    { label: "Task Corner", href: "/tasks", icon: "task_alt", auth: true, hidden: !isPromoter },
    { label: "Help & Support", href: "/help", icon: "support_agent" },
  ];
  const visible = (items: NavItem[]) => items.filter((i) => !i.hidden && (!i.auth || isAuthenticated));

  const onCreate = () => {
    if (!requireAuth("Log in to create offers.")) return;
    router.push(isNormalAccount ? "/plans" : "/create");
  };

  const sidebar = (onNavigate?: () => void) => (
    <>
      <nav className="flex flex-col gap-0.5 px-3">
        {visible(main).map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
        ))}
      </nav>
      <div className="px-4 py-4">
        <button
          onClick={onCreate}
          className="primary-gradient flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] active:scale-[0.98]"
        >
          <Icon name="add_circle" filled className="text-xl" />
          Create
        </button>
      </div>
      <p className="px-7 pb-1 text-[10px] font-bold uppercase tracking-widest text-outline">More</p>
      <nav className="flex flex-col gap-0.5 px-3">
        {visible(more).map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto px-4 pt-6">
        {isAuthenticated ? (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/5"
          >
            <Icon name="logout" className="text-xl" />
            Sign out
          </button>
        ) : (
          <div className="rounded-2xl bg-secondary-container/60 p-4">
            <p className="text-sm font-bold text-on-surface">Join Job Zinda</p>
            <p className="mt-1 text-xs text-on-surface-variant">Follow freelancers, chat and share your work.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/login" className="primary-gradient flex-1 rounded-lg py-2 text-center text-xs font-bold text-white">
                Log in
              </Link>
              <Link href="/signup" className="flex-1 rounded-lg bg-surface-container-lowest py-2 text-center text-xs font-bold text-primary">
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const bottom: NavItem[] = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Search", href: "/search", icon: "search" },
    { label: "Create", href: "#create", icon: "add" },
    { label: "Nearby", href: "/map", icon: "location_on" },
    { label: "Profile", href: "/profile", icon: "person" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="custom-scrollbar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-primary/5 bg-white/70 py-6 backdrop-blur-xl md:flex">
        <div className="mb-6 px-7">
          <Logo />
        </div>
        {sidebar()}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="custom-scrollbar absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-surface-container-lowest py-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between px-6">
              <Logo />
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="rounded-full p-1.5 hover:bg-surface-container">
                <Icon name="close" />
              </button>
            </div>
            {user && (
              <Link href="/profile" className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
                <Avatar src={user.profileImageUrl} name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user.name}</p>
                  <p className="truncate text-xs text-on-surface-variant">{user.profession || user.email}</p>
                </div>
              </Link>
            )}
            {sidebar(() => setDrawerOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col md:ml-64">
        {!fullBleed && <AppBanner />}

        {/* Top bar */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-primary/5 bg-white/70 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="rounded-xl p-2 text-on-surface-variant hover:bg-primary/5">
              <Icon name="menu" />
            </button>
            <Logo />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <Link href="/chat" aria-label="Messages" className="relative rounded-xl p-2 text-on-surface-variant hover:bg-primary/5 hover:text-primary">
                  <Icon name="chat" />
                  {counts.chat > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white" />}
                </Link>
                <Link
                  href="/notifications"
                  aria-label="Notifications"
                  className="relative rounded-xl p-2 text-on-surface-variant hover:bg-primary/5 hover:text-primary"
                >
                  <Icon name="notifications" />
                  {counts.notifications > 0 && (
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white" />
                  )}
                </Link>
                <Link href="/profile" className="ml-1.5 flex items-center gap-2.5">
                  <Avatar src={user?.profileImageUrl} name={user?.name} size="sm" className="ring-2 ring-primary/15" />
                  <span className="hidden text-sm font-semibold text-on-surface lg:block">{user?.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5 sm:px-4">
                  Log in
                </Link>
                <Link href="/signup" className="primary-gradient hidden whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 sm:block">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </header>

        <main className={cn("flex-1", !fullBleed && "pb-24 md:pb-10")}>{children}</main>

        {/* WhatsApp chat button: opens a chat with Job Zinda support */}
        {!fullBleed && (
        <a
          href={SUPPORT.whatsappHello}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 md:bottom-6 md:right-6"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
            <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.43 9.43 0 0 1-1.45-5.02c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.46 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.33-8.03" />
          </svg>
        </a>
        )}

        {/* Mobile bottom navigation */}
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-primary/5 bg-white/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl md:hidden">
          {bottom.map((item) =>
            item.href === "#create" ? (
              <button
                key={item.label}
                onClick={onCreate}
                aria-label="Create"
                className="primary-gradient -mt-6 flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/30"
              >
                <Icon name="add" className="text-3xl" />
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors",
                  isActive(pathname, item.href) ? "text-primary" : "text-on-surface-variant/70",
                )}
              >
                <Icon name={item.icon} filled={isActive(pathname, item.href)} className="text-[22px]" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            ),
          )}
        </nav>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          void logout();
        }}
        title="Sign out?"
        description="You'll need to log in again to chat, post or follow people."
        confirmLabel="Sign out"
        destructive
      />
    </div>
  );
}

/** Wraps pages that need a session; guests get a friendly prompt instead. */
export function RequireAuth({ children, reason }: { children: ReactNode; reason?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
        <div className="primary-gradient flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/30">
          <Icon name="lock" className="text-3xl" />
        </div>
        <h1 className="text-2xl font-extrabold">Log in to continue</h1>
        <p className="text-sm text-on-surface-variant">{reason || "This page is only available to signed-in members."}</p>
        <div className="flex gap-2">
          <Link href="/login" className="primary-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white">
            Log in
          </Link>
          <Link href="/signup" className="rounded-xl bg-secondary-container px-6 py-2.5 text-sm font-bold text-on-secondary-container">
            Sign up
          </Link>
        </div>
      </div>
    );
  return <>{children}</>;
}

/** Standard page container + header used across the app. */
export function Page({
  title,
  subtitle,
  action,
  children,
  className,
  narrow,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 md:px-8 md:py-8", narrow ? "max-w-2xl" : "max-w-6xl", className)}>
      {title && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
