//Environment
require('dotenv').config({ path: '../.env' });
//Libraries
const express = require("express");
const bodyParser = require("body-parser");
var Acuity = require("acuityscheduling");
var svnShifts = require('7shifts')

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


//Timing Scripts
getAcuityData();
setInterval(() => {
  getAcuityData();
}, 14000000);



// Acuity Endpoints
let apptData = []

function getAcuityData() {
  acuity.request("/appointments?max=1000", function(err, res, appointments) {
    if (err) return console.error(err);
    console.log('APPOINTMENTS', appointments.length);
    apptData = appointments
    getSevenShiftsData();
  });
}


// 7 Shifts Endpoints
let shiftData = {}

function getSevenShiftsData() {
  svnShifts.Shifts.list(SVNSHIFTS_API_KEY)
    .then(function(resp) {
      shiftData = JSON.parse(resp.body)
      processData();
    })
    .catch(function(err) {
      console.log(err)
    })
}

function deleteShifts(shiftsToDelete) {
  for (let l = 0; l < shiftsToDelete.length; l++) {
    if (shiftsToDelete[l] == null ||
      new Date(shiftsToDelete[l].shift.start) < new Date() ||
      shiftsToDelete[l].shift.notes.includes("Custom") ||
      shiftsToDelete[l].shift.deleted) {
      continue
    }
    let deletedId = shiftsToDelete[l].shift.id
    console.log("Shift Deleted: ", shiftsToDelete[l].shift.notes, shiftsToDelete[l].shift.start, shiftsToDelete[l].shift.end)
    svnShifts.Shifts.delete(SVNSHIFTS_API_KEY, deletedId)
  }
}

function createShifts(shiftsToCreate) {
  // Creating shifts for new appts.
  for (let k = 0; k < shiftsToCreate.length; k++) {
    let roles = {
      'Galileo FD': 12940,
      'Magellan FD': 12943,
      'Odyssey FD': 12942,
      'Phoenix FD': 12941,
      'Supervisor': 12920,
      'Teacher': 12944
    }
    let roleType = []
    if (shiftsToCreate[k].type.includes('Field Trip') ||
      shiftsToCreate[k].type.includes('Camp')
    ) {
      continue
    }

    let lengthOfTime = 0

    switch (shiftsToCreate[k].type) {
      case 'Magellan 2.5 Hour Flight':
        lengthOfTime = 2.5
        roleType[0] = roles["Magellan FD"]
        roleType[1] = roles["Supervisor"]
        roleType[2] = roles["Supervisor"]
        break;
      case 'Odyssey 2.5 Hour Flight':
        lengthOfTime = 2.5
        roleType[0] = roles["Odyssey FD"]
        break;
      case 'Phoenix 2.5 Hour Flight':
        lengthOfTime = 2.5
        roleType[0] = roles["Phoenix FD"]
        break;
      case 'Galileo 2.5 Hour Flight':
        lengthOfTime = 2.5
        roleType[0] = roles["Galileo FD"]
        break;
      case 'Magellan 5 Hour Flight':
        lengthOfTime = 5
        roleType[0] = roles["Magellan FD"]
        roleType[1] = roles["Supervisor"]
        roleType[2] = roles["Supervisor"]
        break;
      case 'Odyssey 5 Hour Flight':
        lengthOfTime = 5
        roleType[0] = roles["Odyssey FD"]
        break;
      case 'Phoenix 5 Hour Flight':
        lengthOfTime = 5
        roleType[0] = roles["Phoenix FD"]
        break;
      case 'Galileo 5 Hour Flight':
        lengthOfTime = 5
        roleType[0] = roles["Galileo FD"]
        break;
    }

    let startTime = getFormattedDate(new Date(shiftsToCreate[k].datetime))
    let endTime = getFormattedDate(new Date(shiftsToCreate[k].datetime).addHours(lengthOfTime))

    console.log("New " + shiftsToCreate[k].type + " Added: ", startTime, endTime)

    for (let m = 0; m < roleType.length; m++) {
      let newApptBody = {
        shift: {
          start: startTime,
          end: endTime,
          user_id: 0,
          role_id: roleType[m],
          location_id: LOCATION_ID,
          department_id: DEPARTMENT_ID,
          open: true,
          open_offer_type: 1,
          notes: (shiftsToCreate[k].type + ", " + shiftsToCreate[k].id)
        }
      }
      svnShifts.Shifts.create(SVNSHIFTS_API_KEY, newApptBody)
    }
  }
}



function processData() {
  let leftOverAppts = []
  for (let i = 0; i < apptData.length; i++) {
    let ADate = new Date(apptData[i].datetime)
    if (ADate < new Date()) {
      continue
    }
    let shiftExists
    if (apptData[i].type.includes('Magellan')) {
      shiftExists = isAMatch(i)
      shiftExists = isAMatch(i)
      shiftExists = isAMatch(i)
    } else {
      shiftExists = isAMatch(i)
    }

    if (!shiftExists) {
      leftOverAppts.push(apptData[i])
    }
  }

  deleteShifts(shiftData.data)
  createShifts(leftOverAppts)
}

function isAMatch(i) {
  let ADate = new Date(apptData[i].datetime)
  for (let j = 0; j < shiftData.data.length; j++) {
    if (shiftData.data[j] == null) { continue }

    let SDate = new Date(shiftData.data[j].shift.start)
    if ((!shiftData.data[j].shift.deleted) && //If the shift is not deleted
      shiftData.data[j].shift.notes.includes(apptData[i].id) && //If the notes include the type and id of appt
      SDate.getTime() == ADate.getTime()) { //If the times Match
      shiftData.data[j] = null
      return true;
    }
  }
}

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

function getFormattedDate(dateObj) {
  let month = '' + (dateObj.getMonth() + 1),
    day = '' + dateObj.getDate(),
    year = '' + dateObj.getFullYear(),
    hour = '' + dateObj.getHours(),
    minute = '' + dateObj.getMinutes(),
    second = '' + dateObj.getSeconds();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (minute.length < 2) minute = '0' + minute;
  if (second.length < 2) second = '0' + second;
  dateObj = [year, month, day].join('-');
  dateObj = dateObj + " " + [hour, minute, second].join(':');
  return dateObj;
}

function findAssociatedShifts(apptData) {
  let ADate = new Date(apptData[i].datetime)
  let foundShifts = []
  let findAnotherAppt = true
  while (findAnotherAppt) {
    for (let j = 0; j < shiftData.data.length; j++) {
      if (shiftData.data[j] == null) { continue }

      let SDate = new Date(shiftData.data[j].shift.start)
      findAnotherAppt = false
      if ((!shiftData.data[j].shift.deleted) && //If the shift is not deleted
        shiftData.data[j].shift.notes.includes(apptData[i].id) && //If the notes include the type and id of appt
        SDate.getTime() == ADate.getTime()) { //If the times Match
        foundShifts.push(shiftData.data[j])
        shiftData.data[j] = null
        findAnotherAppt = true
      }
    }
  }
  return foundShifts
}

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});