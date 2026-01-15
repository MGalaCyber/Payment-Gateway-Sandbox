require("dotenv").config();

module.exports = {
    System: {
        Port: process.env.PORT || 3000,
        Mode: process.env.MODE === "development" ? true : false,
        Logger: {
            Telegram: {
                ClientId: process.env.TELEGRAM_CLIENT_ID,
                ClientToken: process.env.TELEGRAM_CLIENT_TOKEN,
                ChatId: process.env.TELEGRAM_CHAT_ID,
                ThreadId: process.env.TELEGRAM_THREAD_ID,
            },
        },
    },
    BaseURL: {
        PayProvider: {
            Tripay: "https://tripay.co.id/api-sandbox",
            Midtrans: "https://api.sandbox.midtrans.com",
            Xendit: "",
            Paypal: "https://api-m.sandbox.paypal.com",
        },
    },
    SecretKey: {
        PayProvider: {
            Tripay: {
                ApiKey: process.env.TRIPAY_API_KEY,
                PrivateKey: process.env.TRIPAY_PRIVATE_KEY,
                MerchCode: process.env.TRIPAY_MERCHANT_CODE,
            },
            Midtrans: {
                ServerKey: process.env.MIDTRANS_SERVER_KEY,
                ClientKey: process.env.MIDTRANS_CLIENT_KEY,
                MerchCode: process.env.MIDTRANS_MERCHANT_CODE,
            },
            Paypal: {
                ClientId: process.env.PAYPAL_CLIENT_ID,
                ClientSecret: process.env.PAYPAL_CLIENT_SECRET,
            },
        },
    },
};
