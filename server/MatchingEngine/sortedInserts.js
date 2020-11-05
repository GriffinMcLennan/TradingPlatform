const sortedAscendingInsert = (list, order) => {
    let low = 0;
    let high = list.length;

    while (low < high) {
        let mid = low + Math.floor((high - low) / 2);

        if (list[mid].price >= order.price) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    list.splice(low, 0, order);
};

const sortedDescendingInsert = (list, order) => {
    let low = 0;
    let high = list.length;

    while (low < high) {
        let mid = low + Math.floor((high - low) / 2);

        if (list[mid].price <= order.price) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    list.splice(low, 0, order);
};

module.exports = { sortedAscendingInsert, sortedDescendingInsert };
