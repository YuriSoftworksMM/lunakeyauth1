import type { VercelRequest, VercelResponse } from "vercel";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ad_token } = req.body;

  if (!ad_token) {
    return res.status(400).json({ error: "Missing ad token" });
  }

  // TODO (선택): ad_token 중복 사용 체크 (Supabase/Redis 등)
  // 이미 쓴 토큰이면 여기서 차단

  try {
    const params = new URLSearchParams({
      type: "add",
      amount: "1",
      level: "1",
      expiry: "1", // 7일
      app: "Luna Executor",
      ownerid: process.env.KEYAUTH_OWNERID!,
      secret: process.env.KEYAUTH_SECRET!,
    });

    const r = await fetch("https://keyauth.win/api/seller/", {
      method: "POST",
      body: params,
    });

    const data: any = await r.json();

    if (!data.success) {
      return res.status(500).json({ error: data.message });
    }

    // 생성된 라이선스 키
    const licenseKey = data.keys[0];

    return res.status(200).json({
      success: true,
      license_key: licenseKey,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
