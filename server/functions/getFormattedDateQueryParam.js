function getFormattedDateQueryParam(dateObj) {
    let month = "" + (dateObj.getMonth() + 1);
    let day = "" + (dateObj.getDate() - 1);
    let year = "" + dateObj.getFullYear();
    return `${day.length < 2 ? "0" + day - 1 : day - 1}-${month.length < 2 ? "0" + month : month}-${year}`; // Field trips always start at 9:00am
}