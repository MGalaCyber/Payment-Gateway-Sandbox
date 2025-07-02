const Router = require("express").Router();
const Fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Crypto = require('crypto');


Router.get('/tes', async (req, res) => {
    return res.sendStatus(200)
});

module.exports = Router;