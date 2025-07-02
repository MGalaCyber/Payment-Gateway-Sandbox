const Config = require('../config');
const express = require('express');
require('dotenv').config();
const app = express();

const PORT = Config.System.Port;
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_COUNT = 10;

function rateLimiter(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record) {
        const { lastRequest, count } = record;
        if (now - lastRequest > RATE_LIMIT_WINDOW) {
            rateLimitMap.set(ip, { lastRequest: now, count: 1 });
            return next();
        }
        if (count < RATE_LIMIT_COUNT) {
            rateLimitMap.set(ip, { lastRequest: now, count: count + 1 });
            return next();
        }
        return res.status(429).json({ success: false, message: "Too many requests. Try again later." });
    }
    rateLimitMap.set(ip, { lastRequest: now, count: 1 });
    next();
}

app.enable('trust proxy');
app.use(express.json());
app.use("/api/provider/tripay", rateLimiter, require("./party/tripay"));
// app.use("/api/midtrans", rateLimiter, require("./api/midtrans"));

app.get("/", (req, res) => {
    return res.json({
        status: true,
        code: res.statusCode,
        mode: process.env.MODE
    })
})

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});