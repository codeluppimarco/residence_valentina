import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { roleLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
    : { data: null };

  return (
    <DashboardShell
      userName={profile?.full_name ?? "—"}
      userRoleLabel={profile ? roleLabel(profile.role) : ""}
    >
      {children}
    </DashboardShell>
  );
}
