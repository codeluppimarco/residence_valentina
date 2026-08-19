import { createClient } from "@/lib/supabase/server";
import { DocumentsView, type DocumentWithUrl } from "./DocumentsView";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase.from("documents").select("*").order("doc_date", { ascending: false });

  const withUrls: DocumentWithUrl[] = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 3600);
      return { ...doc, downloadUrl: signed?.signedUrl ?? null };
    }),
  );

  return <DocumentsView documents={withUrls} />;
}
