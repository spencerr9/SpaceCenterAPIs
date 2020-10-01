//Environment
require("dotenv").config({ path: "../.env" });
//Libraries
const express = require("express");
const bodyParser = require("body-parser");
var Acuity = require("acuityscheduling");
var svnShifts = require("7shifts");
const axios = require('axios')


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
let shiftData = {};  // shiftdata.data now equals shiftDataArr throughout the program
let shiftDataArr = []

function getSevenShiftsData(offset) {
  offset = typeof offset !== 'undefined' ? offset : 0

  function getFormattedDate(dateObj) {
    let month = "" + (dateObj.getMonth() + 1),
      day = "" + dateObj.getDate(),
      year = "" + dateObj.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    dateObj = [year, month, day].join("-");
    return dateObj;
  }


  // Send a GET request
  axios({
      method: 'get',
      url: 'https://api.7shifts.com/v1/shifts?limit=500&start[gte]='+getFormattedDate(new Date()),
      auth: {
        username: SVNSHIFTS_API_KEY,
        password: ''
      }
    }).then(function(resp) {
        shiftData = (resp.data)
        console.log('totalShifts',shiftData.data.length);
        shiftDataArr.push(shiftData.data)
    })
    .then(function(){
      shiftDataArr = [].concat.apply([],shiftDataArr)
      console.log('shiftDataArr',shiftDataArr.length)
      if(offset < 501){
        console.log('offset', offset)
        // console.log(shiftDataArr)
        return getSevenShiftsData(offset + 500)
      } else {
        processData();
        return shiftDataArr
      }
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
      shiftsToDelete[l].shift.deleted) { // skip over appts where deleted:true in the appts object
      continue;
    }
    let deletedId = shiftsToDelete[l].shift.id;
    console.log("Shift Deleted: ", shiftsToDelete[l].shift.notes, shiftsToDelete[l].shift.start, shiftsToDelete[l].shift.end);
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
        for(let x = 0; x<filtered.length; x++){
          if(filtered[x].type.includes("Class Field Trip + 4 Simulators (27-40 Students)")){
            x = 0 ? lengthOfTime = timeLengthMorning : lengthOfTime = timeLengthAfternoon
            console.log("Scheduled")
          } else if (filtered[x].type.includes("Class Field Trip + 3 Simulators (22-32 Students)")){
            x = 0 ? lengthOfTime = timeLengthMorning : lengthOfTime = timeLengthAfternoon
            console.log("Scheduled")
          } else if (filtered[x].type.includes("Class Field Trip + 2 Simulators (15-25 Students)")){
            x = 0 ? lengthOfTime = timeLengthMorning : lengthOfTime = timeLengthAfternoon
            console.log("Scheduled")
          }
        }
        break;
        // Nested switch for morning field trips
        // switch (true){
        //   case filtered[0].type.includes("Class Field Trip + 4 Simulators (27-40 Students)"):
        //     lengthOfTime = timeLengthMorning;
        //     roleType[0] = roles["Galileo FD"];
        //     roleType[1] = roles["Magellan FD"];
        //     roleType[2] = roles["Odyssey FD"];
        //     roleType[3] = roles["Phoenix FD"];
        //     roleType[4] = roles["Supervisor"];
        //     roleType[5] = roles["Supervisor"];
        //     roleType[6] = roles["Teacher"];
        //     roleType[7] = roles["Teacher"];
        //     break;
        //   case filtered[0].type.includes("Class Field Trip + 3 Simulators (22-32 Students)"):
        //     lengthOfTime = timeLengthMorning;
        //     roleType[0] = roles["Magellan FD"];
        //     roleType[1] = roles["Odyssey FD"];
        //     roleType[2] = roles["Phoenix FD"];
        //     roleType[3] = roles["Supervisor"];
        //     roleType[4] = roles["Supervisor"];
        //     roleType[5] = roles["Teacher"];
        //     roleType[6] = roles["Teacher"];
        //     break;
        //   case filtered[0].type.includes("Class Field Trip + 2 Simulators (15-25 Students)"):
        //     lengthOfTime = timeLengthMorning;
        //     roleType[0] = roles["Magellan FD"];
        //     roleType[1] = roles["Odyssey FD"];
        //     roleType[2] = roles["Supervisor"];
        //     roleType[3] = roles["Supervisor"];
        //     roleType[4] = roles["Teacher"];
        //     break;
        //   }
        // switch (true) {
        //   case filtered[1].type.includes("Class Field Trip + 4 Simulators (27-40 Students)"):
        //     lengthOfTime = timeLengthAfternoon;
        //     roleType[0] = roles["Galileo FD"];
        //     roleType[1] = roles["Magellan FD"];
        //     roleType[2] = roles["Odyssey FD"];
        //     roleType[3] = roles["Phoenix FD"];
        //     roleType[4] = roles["Supervisor"];
        //     roleType[5] = roles["Supervisor"];
        //     roleType[6] = roles["Teacher"];
        //     roleType[7] = roles["Teacher"];
        //     break;
        //   case filtered[1].type.includes("Class Field Trip + 3 Simulators (22-32 Students)"):
        //     lengthOfTime = timeLengthAfternoon;
        //     roleType[0] = roles["Magellan FD"];
        //     roleType[1] = roles["Odyssey FD"];
        //     roleType[2] = roles["Phoenix FD"];
        //     roleType[3] = roles["Supervisor"];
        //     roleType[4] = roles["Supervisor"];
        //     roleType[5] = roles["Teacher"];
        //     roleType[6] = roles["Teacher"];
        //     break;
        //   case filtered[1].type.includes("Class Field Trip + 2 Simulators (15-25 Students)"):
        //     lengthOfTime = timeLengthAfternoon;
        //     roleType[0] = roles["Magellan FD"];
        //     roleType[1] = roles["Odyssey FD"];
        //     roleType[2] = roles["Supervisor"];
        //     roleType[3] = roles["Supervisor"];
        //     roleType[4] = roles["Teacher"];
        //     break;
        //   }
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
      svnShifts.Shifts.create(SVNSHIFTS_API_KEY, newApptBody)
    }
    break;
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
      shiftDataArr[j].shift.notes.includes("Field Trip")
        ? getFormattedDateFieldTrip(SDate) == getFormattedDateFieldTrip(ADate)
        : getFormattedDate(SDate) == getFormattedDate(ADate) //If the appt type is a field trip
    ) {
      //If the times Match
      shiftDataArr[j] = null;
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
  if (hour.length < 2) hour = "0" + hour;
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
  return `${year}-${month.length < 2 ? "0" + month : month}-${day.length < 2 ? "0" + day : day} 09:00:00`; // Field trips always start at 9:00am
}

function getFormattedDateQueryParam(dateObj) {
  let month = "" + (dateObj.getMonth() + 1);
  let day = "" + (dateObj.getDate() - 1);
  let year = "" + dateObj.getFullYear();
  return `${day.length < 2 ? "0" + day - 1 : day - 1}-${month.length < 2 ? "0" + month : month}-${year}`; // Field trips always start at 9:00am
}


app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
