const Router = require("express").Router();
const Config = require("../../config");
const Crypto = require("node:crypto");
const Logger = require("../logger");

const TRIPAY_MERCHANT_CODE = Config.SecretKey.PayProvider.Tripay.MerchCode;
const TRIPAY_PRIVATE_KEY = Config.SecretKey.PayProvider.Tripay.PrivateKey;
const TRIPAY_API_KEY = Config.SecretKey.PayProvider.Tripay.ApiKey;
const TRIPAY_API_URL = Config.BaseURL.PayProvider.Tripay;

// Get Payment Methods
Router.get("/payment/channel", async (req, res) => {
    try {
        const response = await fetch(`${TRIPAY_API_URL}/merchant/payment-channel`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const result = await response.json();

        let message = `<b>Payment methods fetched successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch payment methods:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payment methods",
            error,
        });
    }
});

// Get transaction status
Router.get("/payment/status/:reference", async (req, res) => {
    try {
        const { reference } = req.params;
        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Missing reference query parameter.",
                data: null,
            });
        }

        const response = await fetch(`${TRIPAY_API_URL}/transaction/check-status?reference=${reference}`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const result = await response.json();

        let message = `<b>Transaction status fetched successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch transaction status:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch transaction status",
            error,
        });
    }
});

// Get Payment Instructions
Router.get("/payment/instruction/:code", async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Missing code query parameter.",
                data: null,
            });
        }

        const response = await fetch(`${TRIPAY_API_URL}/payment/instruction?code=${code}`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const result = await response.json();

        let message = `<b>Payment instructions fetched successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch payment instructions:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payment instructions",
            error,
        });
    }
});

// Create Transaction
Router.post("/transaction/create", async (req, res) => {
    try {
        const request = req.body;
        if (!request || Object.keys(request).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing request body parameters.",
                format: {
                    return_url: "https://example.com/return",
                    method: "BRIVA",
                    merchant_ref: "INV345675",
                    amount: 100_000,
                    customer_name: "Customer Name",
                    customer_email: "[EMAIL_ADDRESS]",
                    customer_phone: "081234567890",
                    order_items: [
                        {
                            sku: "PRODUCT-1",
                            name: "Product Name 1",
                            price: 500000,
                            quantity: 1,
                            product_url: "https://example.com/product/product-name-1",
                            image_url: "https://example.com/product/product-name-1.jpg",
                        },
                    ],
                },
                data: null,
            });
        }

        const signature = Crypto.createHmac("sha256", TRIPAY_PRIVATE_KEY).update(`${TRIPAY_MERCHANT_CODE}${request.merchant_ref}${request.amount}`).digest("hex");

        const now = Math.floor(new Date() / 1000);
        const expiredTime = now + 24 * 60 * 60; // 24 hours

        const payload = {
            ...request,
            merchant_code: TRIPAY_MERCHANT_CODE,
            signature,
            expired_time: expiredTime,
        };

        const response = await fetch(`${TRIPAY_API_URL}/transaction/create`, {
            method: "POST",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        let message = `<b>Transaction created successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to create transaction:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to create transaction",
            error,
        });
    }
});

// Check Transaction Status
Router.get("/transaction/detail/:reference", async (req, res) => {
    try {
        const { reference } = req.params;
        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Missing reference query parameter.",
                data: null,
            });
        }

        const response = await fetch(`${TRIPAY_API_URL}/transaction/detail?reference=${reference}`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const result = await response.json();

        let message = `<b>Transaction detail fetched successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch transaction detail:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch transaction detail",
            error,
        });
    }
});

// Callback
Router.post("/callback", async (req, res) => {
    try {
        const body = req.body;
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing request body parameters.",
                format: {
                    status: "PAID",
                    reference: "T1234567890",
                    merchant_ref: "INV-20240101",
                    total_amount: 100000,
                    payment_method: "BRIVA",
                    paid_at: "2024-01-01 12:00:00",
                },
                data: null,
            });
        }

        if (body.status !== "PAID") {
            return res.status(400).json({ success: false, message: "Transaction is not paid yet" });
        }

        function verifySignature(payload, signature) {
            const payloadString = JSON.stringify(payload);
            const computedSignature = Crypto.createHmac("sha256", TRIPAY_PRIVATE_KEY).update(payloadString).digest("hex");
            return computedSignature === signature;
        }

        const callbackSignature = req.headers["x-callback-signature"];
        if (!callbackSignature) {
            return res.status(400).json({ success: false, message: "No callback signature provided" });
        }
        if (!verifySignature(body, callbackSignature)) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const transactionReference = body.reference;
        const responseDetail = await fetch(`${TRIPAY_API_URL}/transaction/detail?reference=${transactionReference}`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const transactionData = await responseDetail.json();

        if (!transactionData.success || !transactionData.data) {
            return res.status(400).json({ success: false, message: "Transaction not found or invalid" });
        }

        let message = `<b>Callback processed successfully:</b><br>`;
        message += `<code>${JSON.stringify(transactionData, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json({ success: true, message: "Callback processed successfully" });
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch transaction detail:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch transaction detail",
            error,
        });
    }
});

// Get merchant transactions history
Router.get("/merchant/transactions", async (req, res) => {
    try {
        const response = await fetch(`${TRIPAY_API_URL}/merchant/transactions`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const result = await response.json();

        let message = `<b>Transaction history fetched successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch transaction history:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch transaction history",
            error,
        });
    }
});

// Get merchant fee calculation
Router.get("/merchant/fee-calculator", async (req, res) => {
    try {
        const { amount } = req.query;
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Missing amount query parameter.",
                data: null,
            });
        }

        const response = await fetch(`${TRIPAY_API_URL}/merchant/fee-calculator?amount=${amount}`, {
            method: "GET",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Bearer ${TRIPAY_API_KEY}`,
            },
        });
        const result = await response.json();

        let message = `<b>Merchant fee calculation fetched successfully:</b><br>`;
        message += `<code>${JSON.stringify(result, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.json(result);
    } catch (error) {
        console.log(error);

        let message = `<b>Failed to fetch merchant balance:</b><br>`;
        message += `<code>${JSON.stringify(error, null, 2)}</code>`;
        Logger.Telegram(message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch merchant balance",
            error,
        });
    }
});

module.exports = Router;
