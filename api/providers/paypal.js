const Router = require("express").Router();
const Config = require("../../config");
const Crypto = require("node:crypto");
const Logger = require("../logger");

const PAYPAL_CLIENT_ID = Config.SecretKey.PayProvider.Paypal.ClientId;
const PAYPAL_CLIENT_SECRET = Config.SecretKey.PayProvider.Paypal.ClientSecret;
const PAYPAL_API_URL = Config.BaseURL.PayProvider.Paypal;

async function generateAccessToken() {
    try {
        const getAuth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
        const getResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
            method: "POST",
            maxBodyLength: Infinity,
            headers: {
                Authorization: `Basic ${getAuth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });
        const getData = await getResponse.json();
        return getData.access_token;
    } catch (error) {
        console.log("Failed to generate Access Token:", error);
    }
}

Router.post("/checkout/orders", async (req, res) => {
    try {
        const params = req.body;
        if (!params)
            return res.status(400).json({
                success: false,
                message: "Missing request body parameters.",
                format: {
                    intent: "CAPTURE",
                    payment_source: {
                        paypal: {
                            experience_context: {
                                payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                                landing_page: "LOGIN",
                                shipping_preference: "GET_FROM_FILE",
                                user_action: "PAY_NOW",
                                return_url: "https://example.com/returnUrl",
                                cancel_url: "https://example.com/cancelUrl",
                            },
                        },
                    },
                    purchase_units: [
                        {
                            invoice_id: "90210",
                            amount: {
                                currency_code: "USD",
                                value: "230.00",
                                breakdown: {
                                    item_total: {
                                        currency_code: "USD",
                                        value: "220.00",
                                    },
                                    shipping: {
                                        currency_code: "USD",
                                        value: "10.00",
                                    },
                                },
                            },
                            items: [
                                {
                                    name: "T-Shirt",
                                    description: "Super Fresh Shirt",
                                    unit_amount: {
                                        currency_code: "USD",
                                        value: "20.00",
                                    },
                                    quantity: "1",
                                    category: "PHYSICAL_GOODS",
                                    sku: "sku01",
                                    image_url: "https://example.com/static/images/items/1/tshirt_green.jpg",
                                    url: "https://example.com/url-to-the-item-being-purchased-1",
                                    upc: {
                                        type: "UPC-A",
                                        code: "123456789012",
                                    },
                                },
                                {
                                    name: "Shoes",
                                    description: "Running, Size 10.5",
                                    sku: "sku02",
                                    unit_amount: {
                                        currency_code: "USD",
                                        value: "100.00",
                                    },
                                    quantity: "2",
                                    category: "PHYSICAL_GOODS",
                                    image_url: "https://example.com/static/images/items/1/shoes_running.jpg",
                                    url: "https://example.com/url-to-the-item-being-purchased-2",
                                    upc: {
                                        type: "UPC-A",
                                        code: "987654321012",
                                    },
                                },
                            ],
                        },
                    ],
                },
                data: null,
            });

        const getAccessToken = await generateAccessToken();
        const getResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: "POST",
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken}`,
            },
            body: JSON.stringify(params),
        });
        return res.status(200).json({
            success: true,
            message: "Successfully created checkout orders",
            data: getResponse.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch checkout orders",
            data: error.response ? error.response.data : error.message,
        });
    }
});
Router.get("/checkout/orders", async (req, res) => {
    try {
        const { orderId } = req.query;
        if (!orderId)
            return res.status(400).json({
                success: false,
                message: "Missing orderId query parameter.",
                data: null,
            });

        const getAccessToken = await generateAccessToken();
        const getResponse = await Axios.get(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${getAccessToken}`,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Successfully fetched checkout orders",
            data: getResponse.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch checkout orders",
            data: error.response ? error.response.data : error.message,
        });
    }
});
Router.get("/checkout/orders", async (req, res) => {
    try {
        const { orderId } = req.query;
        if (!orderId)
            return res.status(400).json({
                success: false,
                message: "Missing orderId query parameter.",
                data: null,
            });

        const getAccessToken = await generateAccessToken();
        const getResponse = await Axios.get(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${getAccessToken}`,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Successfully fetched checkout orders",
            data: getResponse.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch checkout orders",
            data: error.response ? error.response.data : error.message,
        });
    }
});

module.exports = Router;
