import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const ip =
    (req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim() ||
    req.socket.remoteAddress;

  // 1️⃣ 하루 1회 제한
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: already } = await supabase
    .from("license_pool")
    .select("id")
    .eq("ip", ip)
    .gte("used_at", today.toISOString())
    .limit(1);

  if (already && already.length > 0) {
    return res.json({
      error: "You can only generate one key per day"
    });
  }

  // 2️⃣ 사용 안 된 키 하나 가져오기
  const { data, error } = await supabase
    .from("license_pool")
    .select("*")
    .eq("used", false)
    .limit(1)
    .single();

  if (error || !data) {
    return res.json({
      error: "Keys are out of stock"
    });
  }

  // 3️⃣ 키 사용 처리
  await supabase
    .from("license_pool")
    .update({
      used: true,
      used_at: new Date(),
      ip
    })
    .eq("id", data.id);

  // 4️⃣ 키 반환
  return res.json({
    success: true,
    key: data.key
  });
}
