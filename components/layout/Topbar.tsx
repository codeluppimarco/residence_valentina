import { Avatar } from "@/components/ui/Avatar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import type { Notification } from "@/lib/types";

type TopbarProps = {
  pageTitle: string;
  onHamburgerClick: () => void;
  notifications: Notification[];
  notifOpen: boolean;
  onToggleNotif: () => void;
  profileMenuOpen: boolean;
  onToggleProfile: () => void;
  onCloseMenus: () => void;
  userName: string;
  userRoleLabel: string;
};

export function Topbar({
  pageTitle,
  onHamburgerClick,
  notifications,
  notifOpen,
  onToggleNotif,
  profileMenuOpen,
  onToggleProfile,
  onCloseMenus,
  userName,
  userRoleLabel,
}: TopbarProps) {
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <button
          type="button"
          onClick={onHamburgerClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input border border-border bg-white text-base lg:hidden"
          aria-label="Apri il menu"
        >
          &#9776;
        </button>
        <div className="truncate text-[17px] font-bold text-ink">{pageTitle}</div>
      </div>

      <div className="flex items-center gap-2.5">
        <input
          type="text"
          placeholder="Cerca unità, spese, documenti…"
          aria-label="Cerca unità, spese, documenti"
          className="hidden w-[220px] rounded-input border border-border bg-bg px-3 py-2 text-[13.5px] lg:block"
        />

        <div className="relative z-[41]">
          <button
            type="button"
            onClick={onToggleNotif}
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            aria-label="Notifiche"
            className="relative flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-white text-[15px]"
          >
            &#128276;
            {hasUnread && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-pill border-2 border-white bg-danger" />
            )}
          </button>
          {notifOpen && <NotificationsDropdown notifications={notifications} onNavigate={onCloseMenus} />}
        </div>

        <div className="relative z-[41]">
          <Avatar
            name={userName}
            onClick={onToggleProfile}
            ariaHasPopup="menu"
            ariaExpanded={profileMenuOpen}
          />
          {profileMenuOpen && (
            <ProfileDropdown name={userName} roleLabel={userRoleLabel} onNavigate={onCloseMenus} />
          )}
        </div>
      </div>
    </header>
  );
}
