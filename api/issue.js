import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⭐ anon 아님
);

export default async function handler(req, res) {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress;

    if (!ip) {
      return res.status(400).json({ error: 'IP not found' });
    }

    // 1️⃣ 24시간 제한
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: recent } = await supabase
      .from('claims')
      .select('id')
      .eq('ip', ip)
      .gte('claimed_at', since)
      .limit(1);

    if (recent.length > 0) {
      return res.status(429).json({
        error: 'You can only get one key per day'
      });
    }

    // 2️⃣ 사용 안 된 키 하나 가져오기
    const { data: keys } = await supabase
      .from('licenses')
      .select('*')
      .eq('used', false)
      .limit(1);

    if (!keys || keys.length === 0) {
      return res.status(503).json({
        error: 'Out of stock'
      });
    }

    const key = keys[0];

    // 3️⃣ 키 사용 처리
    await supabase
      .from('licenses')
      .update({
        used: true,
        used_at: new Date(),
        used_ip: ip
      })
      .eq('id', key.id);

    // 4️⃣ 지급 기록
    await supabase
      .from('claims')
      .insert({ ip });

    // 5️⃣ 반환
    return res.json({
      success: true,
      key: key.license_key
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: 'Server error'
    });
  }
}
