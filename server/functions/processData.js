// Finds whether the shift exists based on appts pulled from Acuity
function processData() {
    let leftOverAppts = [];
    for (let i = 0; i < apptData.length; i++) {
        let ADate = new Date(apptData[i].datetime);
        if (ADate < new Date()) {
            continue;
        }
        let shiftExists;
        if (apptData[i].type.includes("Class Field Trip + 4")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else if (apptData[i].type.includes("Class Field Trip + 3")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else if (apptData[i].type.includes("Class Field Trip + 2")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else if (apptData[i].type.includes("Magellan")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else if (apptData[i].type.includes("Cassini")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else if (apptData[i].type.includes("Everest")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else if (apptData[i].type.includes("Valiant")) {
            shiftExists = isAMatch(i);
            shiftExists = isAMatch(i);
        } else {
            shiftExists = isAMatch(i);
        }

        if (!shiftExists) {
            // If shifts don't exist, push them onto the leftOverAppts array.
            leftOverAppts.push(apptData[i]);
        }
    }

    deleteShifts(shiftDataArr); // This is where shifts get deleted
    createShifts(leftOverAppts); // This is where shifts get created
}