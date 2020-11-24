import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import socketIOClient from "socket.io-client";
import OrderBook from "./OrderBook";
import "./TradingInterface.css";

const ENDPOINT = "http://localhost:5000";

function TradingInterface({ logout }) {
    const [price, setPrice] = useState(0);
    const [amount, setAmount] = useState(0);
    const [buyBook, setBuyBook] = useState([]);
    const [sellBook, setSellBook] = useState([]);
    const [lastPrice, setLastPrice] = useState(0);

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        socket.on("OrderBooksUpdate", (data) => {
            setBuyBook(data.publicBuyBook);
            setSellBook(data.publicSellBook);
        });

        socket.on("LastPriceUpdate", (price) => {
            setLastPrice(price);
        });

        //can send our socket info with socket.id

        return () => socket.disconnect();
    }, []);

    const createOrder = async (orderType) => {
        try {
            const response = await axios.post(
                "http://localhost:5000",
                {
                    orderType: orderType,
                    price: parseInt(price),
                    amount: parseInt(amount),
                },
                { withCredentials: true }
            );
        } catch (err) {
            // console.log(err.response);
            if (err.response.data !== "Insufficient funds for the order!") {
                logout();
            }
        }
    };

    return (
        <div className="tradinginterface">
            <div className="order">
                <input
                    placeholder="price"
                    onChange={(e) => setPrice(e.target.value)}
                />
                <input
                    placeholder="amount"
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={() => createOrder("sell")}>Sell Order</button>
                <button onClick={() => createOrder("buy")}>Buy Order</button>
            </div>

            <div className="lastprice">
                <p>Last Price: {lastPrice}</p>
            </div>

            <div className="orderbooks">
                <OrderBook ordersType="Buy Book" orderData={buyBook} />
                <OrderBook ordersType="Sell Book" orderData={sellBook} />
            </div>

            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}

export default TradingInterface;
