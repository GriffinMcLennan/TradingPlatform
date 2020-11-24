const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    balance: Number,
    shares: Number,
});

module.exports = mongoose.model("user", userSchema);
