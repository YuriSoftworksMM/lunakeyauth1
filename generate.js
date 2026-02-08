// api/generate.js
const axios = require('axios');

export default async function handler(req, res) {
    // 환경변수에서 Seller Key를 가져옵니다 (보안 필수)
    const SELLER_KEY = process.env.KEYAUTH_SELLER_KEY;
    
    // KeyAuth Seller API 설정
    const params = {
        sellerkey: SELLER_KEY,
        type: 'add',
        expiry: '1',     // 1일권 (무료 사용자용)
        mask: 'FREE-XXXXXX-XXXXXX',
        level: '1',
        amount: '1',
        format: 'text'
    };

    try {
        const response = await axios.get('https://keyauth.cc/api/seller/', { params });
        
        // KeyAuth 응답 예시: "success:FREE-ABCD-1234"
        if (response.data.includes("success")) {
            const key = response.data.split(":")[1];
            
            // 사용자에게 보여줄 HTML 결과 창
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).send(`
                <div style="text-align:center; margin-top:50px; font-family: sans-serif;">
                    <h1>🎉 Key generated! </h1>
                    <p>Copy this key and paste it into Luna :</p>
                    <h2 style="color:blue; background:#f0f0f0; padding:10px; display:inline-block;">${key}</h2>
                    <br><br>
                    <small>This key will work for 24h.</small>
                </div>
            `);
        } else {
            res.status(500).send("Generating key failed: " + response.data);
        }
    } catch (error) {
        res.status(500).send("Server error occured.");
    }
}
