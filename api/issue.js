export default async function handler(req, res) {
  try {
    const params = new URLSearchParams({
      sellerkey: process.env.KEYAUTH_SELLER_KEY,
      type: "license",
      amount: "1",
      level: "1",       // ⚠️ KeyAuth에 실제 존재하는 Level
      format: "json"
    });

    const response = await fetch(
      "https://keyauth.cc/api/seller/?" + params.toString(),
      { method: "GET" }
    );

    const data = await response.json();

    // 🔍 디버깅용 (중요)
    if (!data.success) {
      return res.status(400).json({
        error: "KeyAuth failed",
        raw: data
      });
    }

    return res.status(200).json({
      key: data.key
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
