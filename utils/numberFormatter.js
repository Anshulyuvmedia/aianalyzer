export const formatCurrency = (value, currency = "₹") => {
    if (value === null || value === undefined) return `${currency} 0.00`;

    const num = Number(value);

    return `${currency} ${num >= 0 ? "+" : ""}${num.toFixed(2)}`;
};

export const formatPercent = (value) => {
    if (value === null || value === undefined) return "0.00%";

    return `${Number(value).toFixed(2)}%`;
};

export const formatCompactNumber = (value) => {
    if (value === null || value === undefined) return "0";

    const num = Number(value);

    if (Math.abs(num) >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M";
    }

    if (Math.abs(num) >= 1_000) {
        return (num / 1_000).toFixed(1) + "K";
    }

    return num.toString();
};