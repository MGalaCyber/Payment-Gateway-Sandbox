const Config = require("../config");
const express = require("express");
require("dotenv").config();
const app = express();

const PORT = Config.System.Port;
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_COUNT = 10;

function rateLimiter(req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
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

app.enable("trust proxy");
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();
});

app.use("/api/provider/tripay", rateLimiter, require("./providers/tripay"));
app.use("/api/provider/paypal", rateLimiter, require("./providers/paypal"));
// app.use("/api/provider/midtrans", rateLimiter, require("./api/midtrans"));

app.get("/", (req, res) => {
    return res.json({
        status: true,
        code: res.statusCode,
        mode: process.env.MODE,
    });
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});

// handle anticrash
process.on("uncaughtException", err => {
    console.log(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
