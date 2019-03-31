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
    SVNSHIFTS_API_KEY
} = process.env;

var acuity = Acuity.basic({
  userId: ACUITY_USER_ID,
  apiKey: ACUITY_API_KEY
});

// Acuity Endpoints
let apptData = []

function acuityAPI(){
  acuity.request("appointments", function(err, res, appointments) {
    if (err) return console.error(err);
      // console.log('APPOINTMENTS',appointments);
      apptData = appointments
      sevenShiftsAPI();
      // console.log("ApptData = ",apptData)
  });
}
acuityAPI();

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

function createShift(body){
  svnShifts.Shifts.create(SVNSHIFTS_API_KEY, body)
  .then(console.log())
}

function padLeft(num, length){
  while(num.length < length){
    num = '0' + num
  }
  return num
}

// console.log(shiftData)
// create shift - WORKS!
// You cannot add more than one user_id when the endpoint is hit, which means that a loop must be created to add more than one user per shift on each day.
// MUST have a user_id (aka employee id) and a department_id (int). role_id (int) = director or supervisor.
// To create an open shift, it MUST indicate "open" as true and "open_offer_type" as 1
// curl -X POST -d '{ "shift": { "start": "2019-04-09 10:00:00", "end": "2019-04-09 11:00:00", "user_id": 0, "role_id": 296565, "location_id": 55212, "department_id": 74580, "open": true, "open_offer_type": 1, "notes": "Type of mission" } }' https://api.7shifts.com/v1/shifts \-u 3WX3WZ8BTC8BF49JGF4CSC6XMAKHTE4T:

function consoleLog(){
  // console.log("APPTS: ", apptData);
  // console.log("SHIFTS: ", shiftData.data);
  // 2019-04-01 10:00:00
  for(let i=0; i<apptData.length; i++){
    let ADate = new Date(apptData[i].datetime)
    for(let j=0; j<shiftData.data.length; j++){
      let SDate = new Date(shiftData.data[j].shift.start)
      // console.log(ADate.valueOf() == SDate.valueOf())
      if(ADate.valueOf() === SDate.valueOf()){
        shiftData.data.slice(j)
        console.log(j)
      } 
      // else {
      //   let shiftBody = { shift: {
      //     start:[padLeft(ADate.getMonth() + 1, 2),
      //               padLeft(ADate.getDate(), 2),
      //               ADate.getFullYear()
      //           ].join('-') + ' ' + [padLeft(ADate.getHours(), 2),
      //               padLeft(ADate.getMinutes(), 2),
      //               padLeft(ADate.getSeconds(), 2)
      //           ].join(':'),
      //     end: [padLeft(ADate.getMonth() + 1, 2),
      //               padLeft(ADate.getDate(), 2),
      //               ADate.getFullYear()
      //       // SEE BUG BELOW AT "+ 2"
      //           ].join('-') + ' ' + [padLeft(ADate.getHours() + 2, 2),
      //               padLeft(ADate.getMinutes(), 2),
      //               padLeft(ADate.getSeconds(), 2)
      //           ].join(':'),
      //     user_id: 0,
      //     role_id: 296565,
      //     location_id: 55212,
      //     department_id: 74580,
      //     open: true,
      //     open_offer_type: 1,
      //     notes: apptData[i].type
      //   }}
      //   createShift(shiftBody)
      // }
    }
    // console.log()
  }
}







app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
