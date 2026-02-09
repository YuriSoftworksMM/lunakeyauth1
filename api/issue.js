export default async function handler(req, res) {
  return res.json({
    length: process.env.KEYAUTH_SELLER_KEY?.length,
    exists: !!process.env.KEYAUTH_SELLER_KEY
  });
}
