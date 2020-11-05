const sortedAscendingInsert = (list, price) => {
    let low = 0;
    let high = list.length;

    while (low < high) {
        let mid = low + Math.floor((high - low) / 2);

        if (list[mid] >= price) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    list.splice(low, 0, price);
};

const sortedDescendingInsert = (list, price) => {
    let low = 0;
    let high = list.length;

    while (low < high) {
        let mid = low + Math.floor((high - low) / 2);

        if (list[mid] <= price) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    list.splice(low, 0, price);
};

module.exports = { sortedAscendingInsert, sortedDescendingInsert };
