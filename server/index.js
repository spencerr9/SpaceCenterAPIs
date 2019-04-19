//Environment
require('dotenv').config({path: '../.env'});
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
function getAcuityData(){
  acuity.request("/appointments?max=1000", function(err, res, appointments) {
    if (err) return console.error(err);
      console.log('APPOINTMENTS',appointments.length);
      apptData = appointments
      getSevenShiftsData();
      // console.log("ApptData = ",apptData)
  });
}


// 7 Shifts Endpoints
let shiftData = {}
function getSevenShiftsData(){
  svnShifts.Shifts.list(SVNSHIFTS_API_KEY)
  .then(function (resp) {
    // console.log("7SHIFTS RESONSE>>>> ",resp.body)
    shiftData = JSON.parse(resp.body)
    processData();
    // console.log("ShiftData = ",shiftData)
  })
  .catch(function (err) {
    console.log(err)
  })
}

function deleteShifts(shiftsToDelete) {
  for(let l=0; l<shiftsToDelete.length; l++){
    if(shiftsToDelete[l] == null ||
      new Date(shiftsToDelete[l].shift.start) < new Date() ||
      shiftsToDelete[l].shift.notes.includes("Custom") ||
      shiftsToDelete[l].shift.deleted)
    {
      continue
    }
    let deletedId = shiftsToDelete[l].shift.id
    console.log("Shift Deleted: ", shiftsToDelete[l].shift.notes, shiftsToDelete[l].shift.start, shiftsToDelete[l].shift.end)
    svnShifts.Shifts.delete(SVNSHIFTS_API_KEY, deletedId)
  }
}

function createShifts(shiftsToCreate) {
  // Creating shifts for new appts.
  for(let k=0; k<shiftsToCreate.length; k++){
    let endTimeHour = parseInt(shiftsToCreate[k].datetime.substr(11,2))+2 >= 24 ? parseInt(shiftsToCreate[k].datetime.substr(11,2))+2 - 24: parseInt(shiftsToCreate[k].datetime.substr(11,2))+2
    let startTime = shiftsToCreate[k].datetime.replace("T"," ").substr(0, 19)
    let endTime = startTime.substr(0, 11)+endTimeHour+startTime.substr(13, 6)
    // console.log("New Appt Added: ", startTime, endTime)

    let roles = {
      'Galileo FD': 12940,
      'Magellan FD': 12943,
      'Odyssey FD': 12942,
      'Phoenix FD': 12941,
      'Supervisor': 12920,
      'Teacher': 12944
    }

    let roleType = []

    switch (shiftsToCreate[k].type) {
      // case 'Day Camp':
      //   console.log("New Day Camp Scheduled: ", startTime, endTime)
      //   break;
      // case 'Extended Camp':
      //   console.log("New Extended Camp Scheduled: ", startTime, endTime)
      //   break;
      // case 'Officer Camp':
      //   console.log("New Officer Camp Scheduled: ", startTime, endTime)
      //   break;
      // case 'Leadership Camp':
      //   console.log("New Leadership Camp Scheduled: ", startTime, endTime)
      //   break;
      // case 'Class Field Trip + 2 Simulators (15-25 Students)':
      //   console.log("New Class Field Trip Scheduled: ", startTime, endTime)
      //   break;
      // case 'Class Field Trip + 4 Simulators (27-40 Students)':
      //   console.log("New Class Field Trip Scheduled: ", startTime, endTime)
      //   break;
      case 'Magellan 2.5 Hour Flight':
        roleType[0] = roles["Magellan FD"]
        roleType[1] = roles["Supervisor"]
        roleType[2] = roles["Supervisor"]
        console.log("New Magellan 2.5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Odyssey 2.5 Hour Flight':
        roleType[0] = roles["Odyssey FD"]
        console.log("New Odyssey 2.5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Phoenix 2.5 Hour Flight':
        roleType[0] = roles["Phoenix FD"]
        console.log("New Phoenix 2.5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Galileo 2.5 Hour Flight':
        roleType[0] = roles["Galileo FD"]
        console.log("New Galileo 2.5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Magellan 5 Hour Flight':
        roleType[0] = roles["Magellan FD"]
        roleType[1] = roles["Supervisor"]
        roleType[2] = roles["Supervisor"]
        console.log("New Magellan 5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Odyssey 5 Hour Flight':
        roleType[0] = roles["Odyssey FD"]
        console.log("New Odyssey 5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Phoenix 5 Hour Flight':
        roleType[0] = roles["Phoenix FD"]
        console.log("New Phoenix 5 Hour Flight Added: ", startTime, endTime)
        break;
      case 'Galileo 5 Hour Flight':
        roleType[0] = roles["Galileo FD"]
        console.log("New Galileo 5 Hour Flight Added: ", startTime, endTime)
        break;
    }

    for(let m=0; m<roleType.length; m++){

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



function processData(){
  let leftOverAppts = []
  for(let i=0; i<apptData.length; i++){
    let ADate = new Date(apptData[i].datetime)
    if(ADate < new Date()){
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

    if(!shiftExists){
      leftOverAppts.push(apptData[i])
    }
  }

  deleteShifts(shiftData.data)
  createShifts(leftOverAppts)
}

function isAMatch(i) {
  let ADate = new Date(apptData[i].datetime)
  for(let j=0; j<shiftData.data.length; j++){
    if(shiftData.data[j] == null) { continue }

    let SDate = new Date(shiftData.data[j].shift.start)
    if((!shiftData.data[j].shift.deleted) && //If the shift is not deleted
        shiftData.data[j].shift.notes.includes(apptData[i].id) && //If the notes include the type and id of appt
        SDate.getTime() == ADate.getTime()){ //If the times Match
      shiftData.data[j] = null
      return true;
    } 
  }
}

function findAssociatedShifts(apptData) {
  let ADate = new Date(apptData[i].datetime)
  let foundShifts = []
  let findAnotherAppt = true
  while (findAnotherAppt) {
    for(let j=0; j<shiftData.data.length; j++){
      if(shiftData.data[j] == null) { continue }

      let SDate = new Date(shiftData.data[j].shift.start)
      findAnotherAppt = false
      if((!shiftData.data[j].shift.deleted) && //If the shift is not deleted
          shiftData.data[j].shift.notes.includes(apptData[i].id) && //If the notes include the type and id of appt
          SDate.getTime() == ADate.getTime()){ //If the times Match
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
