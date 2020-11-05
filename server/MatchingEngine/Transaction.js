class Transaction {
    constructor(
        buyerUUID,
        sellerUUID,
        buyerAmount,
        sellerProfit,
        transactionPrice,
        originalBuyOrderPrice
    ) {
        this.buyerUUID = buyerUUID;
        this.sellerUUID = sellerUUID;
        this.buyerAmount = buyerAmount;
        this.sellerProfit = sellerProfit;
        this.transactionPrice = transactionPrice;
        this.originalBuyOrderPrice = originalBuyOrderPrice;
    }
}

module.exports = Transaction;
