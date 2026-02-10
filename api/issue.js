import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress;

  if (!ip)
    return res.status(400).json({ error: "No IP" });

  // 1️⃣ 24시간 제한
  const since = new Date(Date.now() - 86400000);

  const { data: claimed } = await supabase
    .from('claims')
    .select('*')
    .eq('ip', ip)
    .gte('claimed_at', since);

  if (claimed.length > 0) {
    return res.status(429).json({
      error: "Already claimed today"
    });
  }

  // 2️⃣ 사용 안 된 키 1개
  const { data: keys } = await supabase
    .from('license_pool')
    .select('*')
    .eq('used', false)
    .limit(1);

  if (!keys || keys.length === 0) {
    return res.status(503).json({
      error: "Out of stock"
    });
  }

  const key = keys[0];

  // 3️⃣ 키 사용 처리
  await supabase
    .from('license_pool')
    .update({
      used: true,
      used_at: new Date(),
      used_ip: ip
    })
    .eq('id', key.id);

  // 4️⃣ 기록
  await supabase
    .from('claims')
    .insert({ ip });

  return res.json({
    success: true,
    key: key.key
  });
}
