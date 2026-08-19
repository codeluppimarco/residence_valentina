import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileDropdownProps = {
  name: string;
  roleLabel: string;
  onNavigate: () => void;
};

export function ProfileDropdown({ name, roleLabel, onNavigate }: ProfileDropdownProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="absolute right-0 top-[46px] w-[220px] rounded-card-sm border border-border bg-surface p-2 shadow-dropdown">
      <div className="px-2.5 pt-0.5 text-sm font-bold text-ink">{name}</div>
      <div className="px-2.5 pb-2 text-xs text-sub">{roleLabel}</div>
      <div className="my-1 h-px bg-border" />
      <Link
        href="/profile"
        onClick={onNavigate}
        className="block w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-ink hover:bg-bg"
      >
        Profilo
      </Link>
      <Link
        href="/settings"
        onClick={onNavigate}
        className="block w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-ink hover:bg-bg"
      >
        Impostazioni
      </Link>
      <div className="my-1 h-px bg-border" />
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full rounded-md px-2.5 py-2 text-left text-[13.5px] font-semibold text-danger hover:bg-bg"
      >
        Esci
      </button>
    </div>
  );
}
