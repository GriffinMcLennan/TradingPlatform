const {
    sortedAscendingInsert,
    sortedDescendingInsert,
} = require("./sortedInserts");
const Order = require("./Order");
const Transaction = require("./Transaction");

class MatchingEngine {
    constructor(io) {
        this.buyBook = [];
        this.sellBook = [];
        this.socketIO = io;
        this.uuidBuyAmounts = new Map();
        this.uuidSellAmounts = new Map();
    }

    processOrder(order) {
        const buyBook = this.buyBook;
        const sellBook = this.sellBook;
        console.log("buyBook:", buyBook);
        console.log("sellBook:", sellBook);

        let transactions;

        if (order.type === "buy") {
            transactions = this.processBuyOrder(order);
        } else if (order.type === "sell") {
            transactions = this.processSellOrder(order);
        }

        this.commitTransactions(transactions);
        this.socketIO.emit("OrderBooksUpdate", this.generatePublicOrderBook());

        console.log("BuyMap:", this.uuidBuyAmounts);
        console.log("SellMap:", this.uuidSellAmounts);
    }

    processBuyOrder(buyOrder) {
        //try to fulfill order
        let transactions = [];
        let i = 0;
        const sellBook = this.sellBook;

        while (
            i < sellBook.length &&
            buyOrder.amount > 0 &&
            buyOrder.price >= sellBook[i].price
        ) {
            let sellOrder = sellBook[i];

            let amountToTransfer = Math.min(buyOrder.amount, sellOrder.amount);
            let sellerProfit = amountToTransfer * buyOrder.price;

            transactions.push(
                new Transaction(
                    buyOrder.userUUID,
                    sellOrder.userUUID,
                    amountToTransfer,
                    sellerProfit,
                    buyOrder.price,
                    buyOrder.price
                )
            );

            buyOrder.amount -= amountToTransfer;
            sellOrder.amount -= amountToTransfer;

            if (sellOrder.amount === 0) {
                sellBook.shift();
            } else {
                i++;
            }
        }

        const uuidBuyAmounts = this.uuidBuyAmounts;

        if (buyOrder.amount > 0) {
            console.log("Inserting Order into buyOrders:", buyOrder);
            sortedDescendingInsert(this.buyBook, buyOrder);

            if (uuidBuyAmounts.has(buyOrder.userUUID)) {
                const curAmount = uuidBuyAmounts.get(buyOrder.userUUID);
                uuidBuyAmounts.set(
                    buyOrder.userUUID,
                    curAmount + buyOrder.amount * buyOrder.price
                );
            } else {
                uuidBuyAmounts.set(
                    buyOrder.userUUID,
                    buyOrder.amount * buyOrder.price
                );
            }
        }

        console.log(transactions);
        const uuidSellAmounts = this.uuidSellAmounts;

        for (const transaction of transactions) {
            //close how much they are selling
            const curAmount = uuidSellAmounts.get(transaction.sellerUUID);
            const newAmount = curAmount - transaction.buyerAmount;

            if (newAmount !== 0) {
                uuidSellAmounts.set(transaction.sellerUUID, newAmount);
            } else {
                uuidSellAmounts.delete(transaction.sellerUUID);
            }
        }

        return transactions;
    }

    processSellOrder(sellOrder) {
        let transactions = [];
        let i = 0;
        const buyBook = this.buyBook;

        while (
            i < buyBook.length &&
            sellOrder.amount > 0 &&
            sellOrder.price <= buyBook[i].price
        ) {
            let buyOrder = buyBook[i];

            const amountToTransfer = Math.min(
                sellOrder.amount,
                buyOrder.amount
            );

            const sellerProfit = amountToTransfer * sellOrder.price;

            transactions.push(
                new Transaction(
                    buyOrder.userUUID,
                    sellOrder.userUUID,
                    amountToTransfer,
                    sellerProfit,
                    sellOrder.price,
                    buyOrder.price
                )
            );

            buyOrder.amount -= amountToTransfer;
            sellOrder.amount -= amountToTransfer;

            if (buyOrder.amount === 0) {
                buyBook.shift();
            } else {
                i++;
            }
        }

        const uuidSellAmounts = this.uuidSellAmounts;

        if (sellOrder.amount > 0) {
            console.log("Inserting Order into SellOrders:", sellOrder);
            sortedAscendingInsert(this.sellBook, sellOrder);

            //handle amountMap
            if (uuidSellAmounts.has(sellOrder.userUUID)) {
                const curAmount = uuidSellAmounts.get(sellOrder.userUUID);

                uuidSellAmounts.set(
                    sellOrder.userUUID,
                    curAmount + sellOrder.amount
                );
            } else {
                uuidSellAmounts.set(sellOrder.userUUID, sellOrder.amount);
            }
        }

        console.log(transactions);

        const uuidBuyAmounts = this.uuidBuyAmounts;

        for (const transaction of transactions) {
            //close how much they are buying
            const curAmount = uuidBuyAmounts.get(transaction.buyerUUID);
            const originalBuyOrderTotal =
                transaction.originalBuyOrderPrice * transaction.buyerAmount;
            const newAmount = curAmount - originalBuyOrderTotal;

            if (newAmount !== 0) {
                uuidBuyAmounts.set(transaction.buyerUUID, newAmount);
            } else {
                uuidBuyAmounts.delete(transaction.buyerUUID);
            }
        }

        return transactions;
    }

    commitTransactions(transactions) {
        if (transactions.length === 0) {
            return;
        }

        const n = transactions.length;
        const lastPrice = transactions[n - 1].transactionPrice;

        this.socketIO.emit("LastPriceUpdate", lastPrice);

        //connect to database here
        /* 
            await Promise.all(transactions, updateBalances);
        */
    }

    generatePublicOrderBook() {
        const buyBook = this.buyBook;
        const sellBook = this.sellBook;

        const publicBuyBook = buyBook.map((order) => ({
            price: order.price,
            amount: order.amount,
        }));

        const publicSellBook = sellBook.map((order) => ({
            price: order.price,
            amount: order.amount,
        }));

        return { publicBuyBook, publicSellBook };
    }

    checkUserOpenOrderAmount(type, uuid) {
        let response = 0;

        if (type === "buy") {
            const uuidBuyAmounts = this.uuidBuyAmounts;

            if (uuidBuyAmounts.has(uuid)) {
                response = uuidBuyAmounts.get(uuid);
            }
        } else {
            const uuidSellAmounts = this.uuidSellAmounts;

            if (uuidSellAmounts.has(uuid)) {
                response = uuidSellAmounts.get(uuid);
            }
        }

        return response;
    }
}

module.exports = MatchingEngine;

/*
const ME = new MatchingEngine();

const o1 = new Order(1, "sell", 0.5, 10000);
const o2 = new Order(2, "sell", 0.5, 11000);
const o3 = new Order(3, "sell", 0.5, 12000);
const o4 = new Order(4, "buy", 1.5, 14000);

console.time("time");
ME.processOrder(o1);
ME.processOrder(o2);
ME.processOrder(o3);
ME.processOrder(o4);
console.timeEnd("time");
*/
