require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const MatchingEngine = require("./MatchingEngine/MatchingEngine");
const Order = require("./MatchingEngine/Order");
const app = express();
const mongoose = require("mongoose");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = 5000;
const mongoURL = `${process.env.CONNECTION_URL}`;
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const auth = require("./middleware/authenticate");

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

const whitelist = ["http://localhost:3000"];
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

//socket.io connections
let connections = new Set();

//trading info
const ME = new MatchingEngine(io);

//routes
app.post("/", auth, (req, res) => {
    const { orderType, amount, price } = req.body;
    const uuid = req._id;

    if (
        typeof uuid !== "string" ||
        typeof orderType !== "string" ||
        typeof amount !== "number" ||
        typeof price !== "number" ||
        (orderType !== "buy" && orderType !== "sell") ||
        price <= 0 ||
        amount <= 0
    ) {
        return res.status(400).send("Invalid order parameters");
    }

    console.time("time");
    const order = new Order(uuid, orderType, amount, price);
    ME.processOrder(order);
    console.timeEnd("time");
    res.status(200).send("Successfully handled order");
});

io.on("connection", (socket) => {
    console.log("A client connected to the websocket!");
    connections.add(socket);
    socket.emit("FromAPI", ME.generatePublicOrderBook());

    socket.on("disconnect", () => {
        console.log("A client disconnected from the websocket!");
        connections.delete(socket);
    });
});

/* NEW */

app.use("/register", registerRoute, loginRoute);

app.use("/login", loginRoute);

app.post("/secret", auth, (req, res) => {
    res.status(200).send({ uuid: req._id });
});

app.use((err, req, res, next) => {
    res.status(401).send(err.message);
    console.log("Error:", err.message);
});

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
