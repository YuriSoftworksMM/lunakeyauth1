export default async function handler(req, res) {
  return res.json({
    length: process.env.KEYAUTH_SELLER_KEY?.length,
    exists: !!process.env.KEYAUTH_SELLER_KEY
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://keyauth.win/api/seller/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "addkey",
        sellerkey: process.env.KEYAUTH_SELLER_KEY,
        expiry: "1", // 1 day
        mask: "LUNA-****-****"
      })
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({
        error: "KeyAuth failed",
        message: data.message
      });
    }

    res.status(200).json({
      success: true,
      key: data.key
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
