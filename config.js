require('dotenv').config();

module.exports = {
    System: {
        Port: process.env.PORT,
        Mode: process.env.MODE === "development" ? true: false,
        Webhook: process.env.CUSTOM_WEBHOOK || ""
    },
    BaseURL: {
        PayProvider: {
            Tripay: "https://tripay.co.id/api-sandbox",
            Midtrans: "https://api.sandbox.midtrans.com",
            Xendit: "",
        }
    },
    SecretKey: {
        PayProvider: {
            Tripay: {
                ApiKey: process.env.TRIPAY_API_KEY,
                PrivateKey: process.env.TRIPAY_PRIVATE_KEY,
                MerchCode: process.env.TRIPAY_MERCHANT_CODE,
            },
            Midtrans: {
                ServerKey: process.env.MIDTRANS_SERVERKEY,
                ClientKey: process.env.MIDTRANS_CLIENTKEY,
                MerchCode: process.env.MIDTRANS_MERCHANT_CODE,
            },
        }
    }
}