function createShifts(shiftsToCreate) {
    // Creating shifts for new appts.
    for (let k = 0; k < shiftsToCreate.length; k++) {
        let roles = {
            "Galileo FD": 12940,
            "Magellan FD": 12943,
            "Odyssey FD": 12942,
            "Phoenix FD": 12941,
            "Mag Supervisor": 12920,
            "Teacher": 12944,
            "Everest FD": 543420,
            "Supervisor Everest": 548099,
            "Valiant FD": 543421,
            "Supervisor Valiant": 543422,
            "Dauntless FD": 543419,
            "Cassini FD": 549618,
            "Falcon FD": 549619
        };
        let roleType = [];
        if (
            shiftsToCreate[k].type.includes("Fright") ||
            shiftsToCreate[k].type.includes("Camp") ||
            shiftsToCreate[k].type.includes("MIT") ||
            shiftsToCreate[k].type.includes("Stanford")
        ) {
            continue;
        }

        let lengthOfTime = 0;

        switch (true) {
            case shiftsToCreate[k].type.includes("Magellan 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Magellan FD"];
                roleType[1] = roles["Mag Supervisor"];
                break;
            case shiftsToCreate[k].type.includes("Odyssey 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Odyssey FD"];
                break;
            case shiftsToCreate[k].type.includes("Phoenix 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Phoenix FD"];
                break;
            case shiftsToCreate[k].type.includes("Galileo 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Galileo FD"];
                break;
            case shiftsToCreate[k].type.includes("Everest 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Everest FD"];
                roleType[1] = roles["Supervisor Everest"];
                roleType[2] = roles["Supervisor Everest"];
                break;
            case shiftsToCreate[k].type.includes("Valiant 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Valiant FD"];
                roleType[1] = roles["Supervisor Valiant"];
                break;
            case shiftsToCreate[k].type.includes("Dauntless 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Dauntless FD"];
                break;
            case shiftsToCreate[k].type.includes("Cassini 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Cassini FD"];
                roleType[1] = roles["Cas Supervisor"];
                break;
            case shiftsToCreate[k].type.includes("Falcon 2.5 Hour Flight"):
                lengthOfTime = 2.5;
                roleType[0] = roles["Falcon FD"];
                break;
            case shiftsToCreate[k].type.includes("Magellan 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Magellan FD"];
                roleType[1] = roles["Mag Supervisor"];
                break;
            case shiftsToCreate[k].type.includes("Odyssey 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Odyssey FD"];
                break;
            case shiftsToCreate[k].type.includes("Phoenix 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Phoenix FD"];
                break;
            case shiftsToCreate[k].type.includes("Galileo 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Galileo FD"];
                break;
            case shiftsToCreate[k].type.includes("Everest 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Everest FD"];
                roleType[1] = roles["Supervisor Everest"];
                roleType[2] = roles["Supervisor Everest"];
                break;
            case shiftsToCreate[k].type.includes("Valiant 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Valiant FD"];
                roleType[1] = roles["Supervisor Valiant"];
                break;
            case shiftsToCreate[k].type.includes("Dauntless 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Dauntless FD"];
                break;
            case shiftsToCreate[k].type.includes("Cassini 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Cassini FD"];
                roleType[1] = roles["Cas Supervisor"];
                break;
            case shiftsToCreate[k].type.includes("Falcon 5 Hour Flight"):
                lengthOfTime = 5;
                roleType[0] = roles["Falcon FD"];
                break;
            case shiftsToCreate[k].type.includes("Everest 70 minute Junior Flight"):
                lengthOfTime = 1.2;
                roleType[0] = roles["Everest FD"];
                roleType[1] = roles["Supervisor Everest"];
                roleType[2] = roles["Supervisor Everest"];
                break;
            case shiftsToCreate[k].type.includes("Dauntless 70 minute Junior Flight"):
                lengthOfTime = 1.2;
                roleType[0] = roles["Dauntless FD"];
                break;
            case shiftsToCreate[k].type.includes("Valiant 70 minute Junior Flight"):
                lengthOfTime = 1.2;
                roleType[0] = roles["Valiant FD"];
                roleType[1] = roles["Supervisor Valiant"];
                break;
            case shiftsToCreate[k].type.includes("Class Field Trip"):
                let filtered = shiftsToCreate.filter(obj => obj.date == shiftsToCreate[k].date)
                console.log(filtered)
                let timeLengthMorning = 2.25
                let timeLengthAfternoon = 2
                for (let x = 0; x < filtered.length; x++) {
                    if (filtered[x].type.includes("Class Field Trip + 4 Simulators (27-40 Students)")) {
                        x = 0 ? lengthOfTime = timeLengthMorning : lengthOfTime = timeLengthAfternoon
                        console.log("Scheduled")
                    } else if (filtered[x].type.includes("Class Field Trip + 3 Simulators (22-32 Students)")) {
                        x = 0 ? lengthOfTime = timeLengthMorning : lengthOfTime = timeLengthAfternoon
                        console.log("Scheduled")
                    } else if (filtered[x].type.includes("Class Field Trip + 2 Simulators (15-25 Students)")) {
                        x = 0 ? lengthOfTime = timeLengthMorning : lengthOfTime = timeLengthAfternoon
                        console.log("Scheduled")
                    }
                }
                break;
        }

        let startTime = getFormattedDate(new Date(shiftsToCreate[k].datetime));
        let startTimeFieldTrip = getFormattedDateFieldTrip(new Date(shiftsToCreate[k].datetime)); // Field trip shifts always start at 9am
        let endTime = getFormattedDate(
            new Date(shiftsToCreate[k].datetime).addHours(lengthOfTime)
        );

        console.log(`New ${shiftsToCreate[k].type} Added: ${shiftsToCreate[k].type.includes('Field Trip') ? startTimeFieldTrip : startTime} ${endTime}`)

        for (let m = 0; m < roleType.length; m++) {
            let newApptBody = {
                shift: {
                    start: shiftsToCreate[k].type.includes("Field Trip") ? startTimeFieldTrip : startTime, // If the appt is a field trip, use startTimeFieldTrip. If not, use startTime
                    end: endTime,
                    user_id: 0,
                    role_id: roleType[m],
                    location_id: LOCATION_ID,
                    department_id: DEPARTMENT_ID,
                    open: true,
                    open_offer_type: 1,
                    notes: shiftsToCreate[k].type + ", " + shiftsToCreate[k].id
                }
            };
            console.log('hello')
            svnShifts.Shifts.create(SVNSHIFTS_API_KEY, newApptBody)
        }
        break;
    }
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
};