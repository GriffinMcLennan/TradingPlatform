import React from "react";
import "./OrderBook.css";

function orderBook({ ordersType, orderData }) {
    return (
        <div className="orderbook">
            <h1>{ordersType}</h1>

            {orderData.map((order) => (
                <h3>
                    {order.price} {order.amount}
                </h3>
            ))}
        </div>
    );
}

export default orderBook;
