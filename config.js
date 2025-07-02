require('dotenv').config();

module.exports = {
    System: {
        Port: process.env.PORT,
        Mode: process.env.MODE === "development" ? true: false,
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
            }
        }
    }
}