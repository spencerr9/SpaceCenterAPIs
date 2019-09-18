//Environment
require("dotenv").config({ path: "../.env" });
//Libraries
const express = require("express");
const bodyParser = require("body-parser");
var Acuity = require("acuityscheduling");
var svnShifts = require("7shifts");

//top-level middleware
const app = express();
app.use(bodyParser.json());
app.use(express.json());

const {
  PORT,
  ACUITY_USER_ID,
  ACUITY_API_KEY,
  SVNSHIFTS_API_KEY,
  LOCATION_ID,
  DEPARTMENT_ID
} = process.env;

var acuity = Acuity.basic({
  userId: ACUITY_USER_ID,
  apiKey: ACUITY_API_KEY
});

//Timing Scripts. 6-HOUR INTERVALS
getAcuityData();
setInterval(() => {
  getAcuityData();
}, 21600000);

// Acuity Endpoints
let apptData = [];

function getAcuityData() {
  acuity.request(
    `/appointments?max=1000&direction=ASC&minDate=${getFormattedDateQueryParam(
      new Date()
    )}`,
    function(err, res, appointments) {
      // acuity.request("/appointments/309167140", function(err, res, appointments) {
      if (err) return console.error(err);
      console.log("APPOINTMENTS:", appointments.length);
      console.log(`CYCLE TIME: ${new Date()}`);
      apptData = appointments;
      getSevenShiftsData();
    }
  );
}

// 7 Shifts Endpoints
let shiftData = {};

function getSevenShiftsData(offset) {
  offset = 0
  svnShifts.Shifts.list(SVNSHIFTS_API_KEY, offset)
    .then(function(resp) {
      console.log('resp',resp.body)
      shiftData = JSON.parse(resp.body)
      console.log('line 62',shiftData.data);
      processData();
    })
    .catch(function(err) {
      console.log(err);
    });
}

function deleteShifts(shiftsToDelete) {
  for (let l = 0; l < shiftsToDelete.length; l++) {
    if (
      shiftsToDelete[l] == null || // skip over if the appt is null
      new Date(shiftsToDelete[l].shift.start) < new Date() || // skip over appts in the past
      shiftsToDelete[l].shift.notes.includes("Custom") || // skip over appts that include "Custom" in the notes
      shiftsToDelete[l].shift.deleted
    ) {
      // skip over appts where deleted:true in the appts object
      continue;
    }
    let deletedId = shiftsToDelete[l].shift.id;
    console.log(
      "Shift Deleted: ",
      shiftsToDelete[l].shift.notes,
      shiftsToDelete[l].shift.start,
      shiftsToDelete[l].shift.end
    );
    svnShifts.Shifts.delete(SVNSHIFTS_API_KEY, deletedId);
  }
}

function createShifts(shiftsToCreate) {
  // Creating shifts for new appts.
  for (let k = 0; k < shiftsToCreate.length; k++) {
    let roles = {
      "Galileo FD": 12940,
      "Magellan FD": 12943,
      "Odyssey FD": 12942,
      "Phoenix FD": 12941,
      "Supervisor": 12920,
      "Teacher": 12944
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

    switch (shiftsToCreate[k].type) {
      case "Magellan 2.5 Hour Flight":
        lengthOfTime = 2.5;
        roleType[0] = roles["Magellan FD"];
        roleType[1] = roles["Supervisor"];
        roleType[2] = roles["Supervisor"];
        break;
      case "Odyssey 2.5 Hour Flight":
        lengthOfTime = 2.5;
        roleType[0] = roles["Odyssey FD"];
        break;
      case "Phoenix 2.5 Hour Flight":
        lengthOfTime = 2.5;
        roleType[0] = roles["Phoenix FD"];
        break;
      case "Galileo 2.5 Hour Flight":
        lengthOfTime = 2.5;
        roleType[0] = roles["Galileo FD"];
        break;
      case "Magellan 5 Hour Flight":
        lengthOfTime = 5;
        roleType[0] = roles["Magellan FD"];
        roleType[1] = roles["Supervisor"];
        roleType[2] = roles["Supervisor"];
        break;
      case "Odyssey 5 Hour Flight":
        lengthOfTime = 5;
        roleType[0] = roles["Odyssey FD"];
        break;
      case "Phoenix 5 Hour Flight":
        lengthOfTime = 5;
        roleType[0] = roles["Phoenix FD"];
        break;
      case "Galileo 5 Hour Flight":
        lengthOfTime = 5;
        roleType[0] = roles["Galileo FD"];
        break;
      case "Class Field Trip + 4 Simulators (27-40 Students)":
        lengthOfTime = 4.25;
        roleType[0] = roles["Galileo FD"];
        roleType[1] = roles["Magellan FD"];
        roleType[2] = roles["Odyssey FD"];
        roleType[3] = roles["Phoenix FD"];
        roleType[4] = roles["Supervisor"];
        roleType[5] = roles["Supervisor"];
        roleType[6] = roles["Teacher"];
        roleType[7] = roles["Teacher"];
        break;
      case "Class Field Trip + 3 Simulators (22-32 Students)":
        lengthOfTime = 4.25;
        roleType[0] = roles["Magellan FD"];
        roleType[1] = roles["Odyssey FD"];
        roleType[2] = roles["Phoenix FD"];
        roleType[3] = roles["Supervisor"];
        roleType[4] = roles["Supervisor"];
        roleType[5] = roles["Teacher"];
        roleType[6] = roles["Teacher"];
        break;
      case "Class Field Trip + 2 Simulators (15-25 Students)":
        lengthOfTime = 4.25;
        roleType[0] = roles["Magellan FD"];
        roleType[1] = roles["Odyssey FD"];
        roleType[2] = roles["Supervisor"];
        roleType[3] = roles["Supervisor"];
        roleType[4] = roles["Teacher"];
        break;
    }

    let startTime = getFormattedDate(new Date(shiftsToCreate[k].datetime));
    let startTimeFieldTrip = getFormattedDateFieldTrip(
      new Date(shiftsToCreate[k].datetime)
    ); // Field trip shifts always start at 9am
    let endTime = getFormattedDate(
      new Date(shiftsToCreate[k].datetime).addHours(lengthOfTime)
    );

    // console.log(`New ${shiftsToCreate[k].type} Added: ${shiftsToCreate[k].type.includes('Field Trip') ? startTimeFieldTrip : startTime} ${endTime}`)

    for (let m = 0; m < roleType.length; m++) {
      // let notesString = `${shiftsToCreate[k].type.replace('+','').replace('(','').replace(')','')}, ${shiftsToCreate[k].id}`
      let newApptBody = {
        shift: {
          start: shiftsToCreate[k].type.includes("Field Trip")
            ? startTimeFieldTrip
            : startTime, // If the appt is a field trip, use startTimeFieldTrip. If not, use startTime
          // start: startTime,
          end: endTime,
          user_id: 0,
          role_id: roleType[m],
          location_id: LOCATION_ID,
          department_id: DEPARTMENT_ID,
          open: true,
          open_offer_type: 1,
          notes: shiftsToCreate[k].type + ", " + shiftsToCreate[k].id
          // notes: notesString
        }
      };
      // svnShifts.Shifts.create(SVNSHIFTS_API_KEY, newApptBody)
    }
  }
}

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
      shiftExists = isAMatch(i);
    } else {
      shiftExists = isAMatch(i);
    }

    if (!shiftExists) {
      // If shifts don't exist, push them onto the leftOverAppts array.
      leftOverAppts.push(apptData[i]);
    }
  }

  deleteShifts(shiftData.data); // This is where shifts get deleted
  createShifts(leftOverAppts); // This is where shifts get created
}

function isAMatch(i) {
  let ADate = new Date(apptData[i].datetime);
  for (let j = 0; j < shiftData.data.length; j++) {
    if (shiftData.data[j] == null) {
      continue;
    }

    let SDate = new Date(shiftData.data[j].shift.start);
    if (
      !shiftData.data[j].shift.deleted && //If the shift is not deleted
      shiftData.data[j].shift.notes.includes(apptData[i].id) && //If the notes include the id of appt
      shiftData.data[j].shift.notes.includes(apptData[i].type) && //If the notes include the type of appt
      shiftData.data[j].shift.notes.includes("Field Trip")
        ? getFormattedDateFieldTrip(SDate) == getFormattedDateFieldTrip(ADate)
        : getFormattedDate(SDate) == getFormattedDate(ADate)
    ) {
      //If the times Match
      shiftData.data[j] = null;
      return true;
    }
  }
}

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

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

function getFormattedDateFieldTrip(dateObj) {
  let month = "" + (dateObj.getMonth() + 1);
  let day = "" + dateObj.getDate();
  let year = "" + dateObj.getFullYear();
  return `${year}-${month.length < 2 ? "0" + month : month}-${
    day.length < 2 ? "0" + day : day
  } 09:00:00`; // Field trips always start at 9:00am
}

function getFormattedDateQueryParam(dateObj) {
  let month = "" + (dateObj.getMonth() + 1);
  let day = "" + (dateObj.getDate() - 1);
  let year = "" + dateObj.getFullYear();
  return `${day.length < 2 ? "0" + day - 1 : day - 1}-${
    month.length < 2 ? "0" + month : month
  }-${year}`; // Field trips always start at 9:00am
  // return `${year}-${month.length < 2 ? "0"+month:month}-${day.length < 2 ? "0"+day:day} 09:00:00`; // Field trips always start at 9:00am
}

// function findAssociatedShifts(apptData) {
//   let ADate = new Date(apptData[i].datetime)
//   let foundShifts = []
//   let findAnotherAppt = true
//   while (findAnotherAppt) {
//     for (let j = 0; j < shiftData.data.length; j++) {
//       if (shiftData.data[j] == null) { continue }

//       let SDate = new Date(shiftData.data[j].shift.start)
//       findAnotherAppt = false
//       if ((!shiftData.data[j].shift.deleted) && //If the shift is not deleted
//         shiftData.data[j].shift.notes.includes(apptData[i].id) && //If the notes include the type and id of appt
//         SDate.getTime() == ADate.getTime()) { //If the times Match
//         foundShifts.push(shiftData.data[j])
//         shiftData.data[j] = null
//         findAnotherAppt = true
//       }
//     }
//   }
//   return foundShifts
// }

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
