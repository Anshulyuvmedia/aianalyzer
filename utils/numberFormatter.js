export const formatCurrency = (value, currency = "₹") => {
    if (value === null || value === undefined) return `${currency} 0`;

    const num = Number(value);
    const abs = Math.abs(num);

    let formatted = "";

    if (abs >= 1e7) {
        formatted = (num / 1e7).toFixed(2) + " Cr";
    } else if (abs >= 1e5) {
        formatted = (num / 1e5).toFixed(2) + " L";
    } else if (abs >= 1e3) {
        formatted = (num / 1e3).toFixed(2) + " K";
    } else {
        formatted = num.toFixed(2);
    }

    return `${currency} ${num >= 0 ? "" : ""}${formatted}`;
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