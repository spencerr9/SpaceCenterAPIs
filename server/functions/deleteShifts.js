function deleteShifts(shiftsToDelete) {
    for (let l = 0; l < shiftsToDelete.length; l++) {
        if (
            shiftsToDelete[l] == null || // skip over if the appt is null
            new Date(shiftsToDelete[l].shift.start) < new Date() || // skip over appts in the past
            shiftsToDelete[l].shift.notes.includes("Custom") || // skip over appts that include "Custom" in the notes
            shiftsToDelete[l].shift.deleted) { // skip over appts where deleted:true in the appts object
            continue;
        }
        let deletedId = shiftsToDelete[l].shift.id;
        console.log("Shift Deleted: ", shiftsToDelete[l].shift.notes, shiftsToDelete[l].shift.start, shiftsToDelete[l].shift.end);
        svnShifts.Shifts.delete(SVNSHIFTS_API_KEY, deletedId);
    }
}