export default async function handler(req, res) {
  try {
    const params = new URLSearchParams({
      sellerkey: process.env.KEYAUTH_SELLER_KEY,
      type: "license",
      amount: "1",
      level: "1"
    });

    const response = await fetch(
      "https://keyauth.cc/api/seller/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const text = await response.text(); // ⭐ 중요

    // JSON인지 먼저 확인
    if (!text.trim().startsWith("{")) {
      return res.status(500).json({
        error: "KeyAuth returned non-JSON",
        raw: text.slice(0, 200)
      });
    }

    const data = JSON.parse(text);

    if (!data.success) {
      return res.status(500).json({
        error: "KeyAuth failed",
        message: data.message || data
      });
    }

    return res.status(200).json({
      success: true,
      key: data.key
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
