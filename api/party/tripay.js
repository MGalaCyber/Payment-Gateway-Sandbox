const Fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const VoucherCode = require("voucher-code-generator");
const Router = require('express').Router();
const Config = require('../../config');
const Crypto = require('crypto');
const Axios = require('axios');
require('dotenv').config();

const TRIPAY_MERCHANT_CODE = Config.SecretKey.PayProvider.Tripay.MerchCode;
const TRIPAY_PRIVATE_KEY = Config.SecretKey.PayProvider.Tripay.PrivateKey;
const TRIPAY_API_KEY = Config.SecretKey.PayProvider.Tripay.ApiKey;
const TRIPAY_API_URL = Config.BaseURL.PayProvider.Tripay;
const WEBHOOKS = (Config.System.Webhook).split(",").map(url => url.trim()).filter(Boolean);

// Get Payment Methods
Router.get('/payment/channel', async (req, res) => {
    try {
        const response = await Axios.get(`${TRIPAY_API_URL}/merchant/payment-channel`, {
            headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` },
        });
        return res.json(response.data);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment methods',
            error
        });
    }
});

// Get Payment Instructions
Router.get('/payment/instruction/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const response = await Axios.get(`${TRIPAY_API_URL}/payment/instruction?code=${code}`, {
            headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` },
        });
        return res.json(response.data);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment instructions',
            error
        });
    }
});

// Create Transaction
Router.post('/transaction/create', async (req, res) => {
    try {
        const request = req.body;
        const signature = Crypto.createHmac('sha256', TRIPAY_PRIVATE_KEY)
            .update(`${TRIPAY_MERCHANT_CODE}${request.merchant_ref}${request.amount}`)
            .digest('hex');

        const now = Math.floor(new Date() / 1000);
        const expiredTime = now + (24 * 60 * 60); // 24 jam

        const payload = {
            ...request,
            merchant_code: TRIPAY_MERCHANT_CODE,
            signature,
            expired_time: expiredTime
        };

        const response = await Axios.post(`${TRIPAY_API_URL}/transaction/create`, payload, {
            headers: {
                'Authorization': `Bearer ${TRIPAY_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return res.json(response.data);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create transaction',
            error
        });
    }
});

// Check Transaction Status
Router.get('/transaction/detail/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await Axios.get(`${TRIPAY_API_URL}/transaction/detail?reference=${reference}`, {
            headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` },
        });
        return res.json(response.data);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction detail',
            error
        });
    }
});

Router.post("/callback", async (req, res) => {
    try {
        const body = req.body;

        if (body.status !== "PAID") {
            return res.status(400).json({ success: false, message: "Transaction is not paid yet" });
        }

        function generateRedeemCode(length = 10) {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code = "";
            for (let i = 0; i < length; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return code;
        }

        function generateVoucherCode(format) {
            const genCode = VoucherCode.generate({
                pattern: format
            });
            const codeFormat = genCode.toString().toUpperCase();
            return codeFormat;
        }

        function extractAfterDash(input) {
            if (typeof input !== "string") return null;
            const parts = input.split("-");
            return parts.length > 1 ? parts[parts.length - 1].trim() : null;
        }

        function generateUserId() {
            const randomBuffer = Crypto.randomBytes(6);
            return parseInt(randomBuffer.toString("hex"), 16).toString().slice(0, 12);
        }

        function verifySignature(payload, signature) {
            const payloadString = JSON.stringify(payload);
            const computedSignature = Crypto.createHmac("sha256", TRIPAY_PRIVATE_KEY)
                .update(payloadString)
                .digest("hex");
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
        const responseDetail = await Axios.get(`${TRIPAY_API_URL}/transaction/detail?reference=${transactionReference}`, {
            headers: { 'Authorization': `Bearer ${TRIPAY_API_KEY}` },
        });

        const transactionData = responseDetail.data;
        if (!transactionData.success || !transactionData.data) {
            return res.status(400).json({ success: false, message: "Transaction not found or invalid" });
        }

        const { data } = transactionData;
        // const redeemCode = generateRedeemCode();
        const redeemCode = await generateVoucherCode("####-####-###-####-####");
        const genUserId = await generateUserId();
        const getType = await extractAfterDash(data.order_items[0].sku);

        const genJson = {
            success: true,
            message: "Callback processed successfully",
            code_redeem: redeemCode,
            user_id: genUserId,
            type: getType,
            data
        };

        // Broadcast ke semua webhook
        Promise.allSettled(WEBHOOKS.map(url =>
            Fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(genJson)
            })
        )).then(() => {
            return res.json({ success: true, message: "Callback processed successfully" });
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction detail',
            error
        });
    }
});

module.exports = Router;