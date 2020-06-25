function getFormattedDateFieldTrip(dateObj) {
    let month = "" + (dateObj.getMonth() + 1);
    let day = "" + dateObj.getDate();
    let year = "" + dateObj.getFullYear();
    return `${year}-${month.length < 2 ? "0" + month : month}-${day.length < 2 ? "0" + day : day} 09:00:00`; // Field trips always start at 9:00am
}