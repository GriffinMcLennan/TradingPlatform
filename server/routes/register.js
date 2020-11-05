const express = require("express");
const mongoose = require("mongoose");
const User = require("./../models/User");
const bcrypt = require("bcrypt");
let router = express.Router();

const saltRounds = 10;

router.post("/", async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const users = await User.find({ username: username });
        const usernameTaken = users.length > 0;

        if (usernameTaken) {
            return res.status(401).send("Error: Username taken");
        }

        const hash = await bcrypt.hash(password, saltRounds);

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username: username,
            password: hash,
        });

        await user.save();

        next();
    } catch (e) {
        console.log("Error:", e.message);
        return res.status(400).send(e.message);
    }
});

module.exports = router;
