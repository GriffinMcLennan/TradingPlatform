class Order {
    constructor(userUUID, type, amount, price) {
        this.userUUID = userUUID;
        this.type = type;
        this.amount = amount; //amount in cryptocurrency for both buy and sell orders
        this.price = price;
    }
}

module.exports = Order;
