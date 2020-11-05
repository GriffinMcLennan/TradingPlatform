const express = require("express");
const mongoose = require("mongoose");
const User = require("./../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
let router = express.Router();

const privateKey = fs.readFileSync(
    __dirname + "/../keys/privateKey.key",
    "utf8"
);
const FIVE_MINUTES = 5 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

router.post("/", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(401).send("Error: User not found");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).send("Error: Password doesn't match");
        }

        const accessToken = await jwt.sign({ uuid: user._id }, privateKey, {
            algorithm: "RS256",
            expiresIn: "5m",
        });
        const refreshToken = await jwt.sign({ uuid: user._id }, privateKey, {
            algorithm: "RS256",
            expiresIn: "15m",
        });

        res.cookie("accessToken", accessToken, {
            maxAge: FIVE_MINUTES,
            httpOnly: true,
            sameSite: "strict",
        });
        res.cookie("refreshToken", refreshToken, {
            maxAge: FIFTEEN_MINUTES,
            httpOnly: true,
            sameSite: "strict",
        });
        res.cookie("isLoggedIn", true);

        return res
            .status(200)
            .send({ msg: "Successfully logged in", uuid: user._id });
    } catch (err) {
        console.log("Error:", err.message);
        return res.status(400).send();
    }
});

module.exports = router;
