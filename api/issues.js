export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const response = await fetch("https://keyauth.win/api/1.2/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      type: "license",
      days: "1",
      amount: "1",
      level: "1",

      ownerid: process.env.KEYAUTH_OWNERID,
      appname: process.env.KEYAUTH_APPNAME,
      secret: process.env.KEYAUTH_SECRET
    })
  });

  const data = await response.json();

  if (!data.success) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    license_key: data.license
  });
}
