import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const auth = req.headers.authorization;

  if (!auth || auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action } = req.query;

  // 🔍 키 목록 조회
  if (action === "list") {
    const { data } = await supabase
      .from("license_pool")
      .select("*")
      .order("used", { ascending: true });

    return res.json(data);
  }

  // ➕ 키 추가
  if (action === "add") {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: "No key" });

    await supabase.from("license_pool").insert({ key });
    return res.json({ success: true });
  }

  // ❌ 키 삭제
  if (action === "delete") {
    const { id } = req.body;
    await supabase.from("license_pool").delete().eq("id", id);
    return res.json({ success: true });
  }

  res.status(400).json({ error: "Invalid action" });
}
