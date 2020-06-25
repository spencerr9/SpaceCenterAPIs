function getFormattedDate(dateObj) {
    let month = "" + (dateObj.getMonth() + 1),
        day = "" + dateObj.getDate(),
        year = "" + dateObj.getFullYear(),
        hour = "" + dateObj.getHours(),
        minute = "" + dateObj.getMinutes(),
        second = "" + dateObj.getSeconds();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    if (minute.length < 2) minute = "0" + minute;
    if (second.length < 2) second = "0" + second;
    dateObj = [year, month, day].join("-");
    dateObj = dateObj + " " + [hour, minute, second].join(":");
    return dateObj;
}