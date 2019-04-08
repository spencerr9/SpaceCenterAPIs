require('dotenv').config({path: '../.env'});

const express = require("express");
const bodyParser = require("body-parser");


var Acuity = require("acuityscheduling");
var svnShifts = require('7shifts')

const app = express();

//top-level middleware
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

// Acuity Endpoints
let apptData = []

function acuityAPI(){
  acuity.request("/appointments?max=1000", function(err, res, appointments) {
    if (err) return console.error(err);
      console.log('APPOINTMENTS',appointments.length);
      apptData = appointments
      sevenShiftsAPI();
      // console.log("ApptData = ",apptData)
  });
}

acuityAPI();
setInterval(() => {
  acuityAPI();
}, 87000000);

// 7 Shifts Endpoints
let shiftData = {}

function sevenShiftsAPI(){
  svnShifts.Shifts.list(SVNSHIFTS_API_KEY)
  .then(function (resp) {
    // console.log("7SHIFTS RESONSE>>>> ",resp.body)
    shiftData = JSON.parse(resp.body)
    consoleLog();
    // console.log("ShiftData = ",shiftData)
  })
  .catch(function (err) {
    console.log(err)
  })
} 

// function createShift(body){
//   svnShifts.Shifts.create(SVNSHIFTS_API_KEY, body)
//   .then(console.log())
// }

// function padLeft(num, length){
//   while(num.length < length){
//     num = '0' + num
//   }
//   return num
// }

// console.log(shiftData)

function consoleLog(){
  // console.log("APPTS: ", apptData);
  // console.log("SHIFTS: ", shiftData.data);
  let newShiftData = []
  let leftOverAppts = []
  let campAppts = {}
  for(let i=0; i<apptData.length; i++){
    let ADate = new Date(apptData[i].datetime)
    if(ADate < new Date()){
      continue
    }
    if(apptData[i].type.includes("Camp")){
      let campKey = apptData[i].type + apptData[i].datetime
      if(!campAppts[campKey]){
        apptData[i].id = "***"
        campAppts[campKey] = true
      } else {
        continue
      }
    }
    let shiftExists = false
    for(let j=0; j<shiftData.data.length; j++){
      if(shiftData.data[j] == null) {
        continue
      }
      SDate = new Date(shiftData.data[j].shift.start)
      if(
          shiftData.data[j].shift.notes.includes(apptData[i].id) &&
          SDate.getTime() == ADate.getTime()
        ){
        shiftExists = true
        shiftData.data[j] = null
      } 
    }
    if(!shiftExists){
      leftOverAppts.push(apptData[i]) 
    }
  }

  // Deleting shifts for deleted appointments
  for(let l=0; l<shiftData.data.length; l++){
    if(shiftData.data[l] == null){
      continue
    }
    if(new Date(shiftData.data[l].shift.start) < new Date()){
      continue
    }
    if(shiftData.data[l].shift.notes.includes("Custom")){
      continue
    }
    let deletedId = shiftData.data[l].shift.id
    console.log("Shift Deleted: ", deletedId, shiftData.data[l].shift.start, shiftData.data[l].shift.end)
    svnShifts.Shifts.delete(SVNSHIFTS_API_KEY, deletedId)
    // .catch(err => console.log(err))
  }

  // Creating shifts for new appts.
  for(let k=0; k<leftOverAppts.length; k++){
    let endTimeHour = parseInt(leftOverAppts[k].datetime.substr(11,2))+2 >= 24 ? parseInt(leftOverAppts[k].datetime.substr(11,2))+2 - 24: parseInt(leftOverAppts[k].datetime.substr(11,2))+2
    let startTime = leftOverAppts[k].datetime.replace("T"," ").substr(0, 19)
    let endTime = startTime.substr(0, 11)+endTimeHour+startTime.substr(13, 6)
    // console.log("New Appt Added: ", startTime, endTime)

    let roles = {
      'Galileo FD': 304018,
      'Magellan FD': 304014,
      'Odyssey FD': 304016,
      'Phoenix FD': 304017,
      'Supervisor': 304015,
      'Teacher': 304019
    }

    let roleType = []

    switch (leftOverAppts[k].type) {
      case 'Day Camp':
        roleType[0] = roles["Magellan FD"]
        roleType[1] = roles["Supervisor"]
        roleType[2] = roles["Supervisor"]
        roleType[3] = roles["Odyssey FD"]
        roleType[4] = roles["Galileo FD"]
        roleType[5] = roles["Phoenix FD"]
        console.log("New Day Camp Added: ", startTime, endTime)
        break;
      case 'Extended Camp':
        roleType[0] = roles["Magellan FD"]
        roleType[1] = roles["Supervisor"]
        roleType[2] = roles["Supervisor"]
        roleType[3] = roles["Odyssey FD"]
        roleType[4] = roles["Galileo FD"]
        console.log("New Extended Camp Added: ", startTime, endTime)
        break;
      case 'Officer Camp':
        roleType[0] = roles["Teacher"]
        console.log("New Officer Camp Added: ", startTime, endTime)
        break;
      case 'Leadership Camp':
        // roleType[0] = roles["Teacher"]
        console.log("New Leadership Camp Added: ", startTime, endTime)
        break;
      case 'Class Field Trip + 2 Simulators (15-25 Students)':
        roleType[0] = roles["Teacher"]
        console.log("New Class Field Trip Added: ", startTime, endTime)
        break;
      case 'Class Field Trip + 4 Simulators (27-40 Students)':
        roleType[0] = roles["Teacher"]
        console.log("New Class Field Trip Added: ", startTime, endTime)
        break;
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
          notes: (leftOverAppts[k].type + ", " + leftOverAppts[k].id)
        }
      }
      svnShifts.Shifts.create(SVNSHIFTS_API_KEY, newApptBody)
    }
    }
}







app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
