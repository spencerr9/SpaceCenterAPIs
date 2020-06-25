function isAMatch(i) {
    let ADate = new Date(apptData[i].datetime);
    for (let j = 0; j < shiftDataArr.length; j++) {
        if (shiftDataArr[j] == null) {
            continue;
        }

        let SDate = new Date(shiftDataArr[j].shift.start);
        if (
            !shiftDataArr[j].shift.deleted && //If the shift is not deleted
            shiftDataArr[j].shift.notes.includes(apptData[i].id) && //If the notes include the id of appt
            shiftDataArr[j].shift.notes.includes(apptData[i].type) && //If the notes include the type of appt
            shiftDataArr[j].shift.notes.includes("Field Trip") ?
            getFormattedDateFieldTrip(SDate) == getFormattedDateFieldTrip(ADate) :
            getFormattedDate(SDate) == getFormattedDate(ADate) //If the appt type is a field trip
        ) {
            //If the times Match
            shiftDataArr[j] = null;
            return true;
        }
    }
}