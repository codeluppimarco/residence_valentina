"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { notifications } from "@/lib/mock-data";
import { getPageTitle } from "@/lib/nav";

type DashboardShellProps = {
  children: ReactNode;
  userName: string;
  userRoleLabel: string;
};

export function DashboardShell({ children, userName, userRoleLabel }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const closeMenus = () => {
    setNotifOpen(false);
    setProfileMenuOpen(false);
  };

  const anyOverlayOpen = mobileNavOpen || notifOpen || profileMenuOpen;

  useEffect(() => {
    if (!anyOverlayOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileNavOpen(false);
      closeMenus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [anyOverlayOpen]);

  return (
    <div className="flex min-h-screen">
      {(notifOpen || profileMenuOpen) && (
        <div className="fixed inset-0 z-20" onClick={closeMenus} />
      )}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/45 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar pathname={pathname} open={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          pageTitle={getPageTitle(pathname)}
          onHamburgerClick={() => setMobileNavOpen((v) => !v)}
          notifications={notifications}
          notifOpen={notifOpen}
          onToggleNotif={() => {
            setNotifOpen((v) => !v);
            setProfileMenuOpen(false);
          }}
          profileMenuOpen={profileMenuOpen}
          onToggleProfile={() => {
            setProfileMenuOpen((v) => !v);
            setNotifOpen(false);
          }}
          onCloseMenus={closeMenus}
          userName={userName}
          userRoleLabel={userRoleLabel}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  );
}
