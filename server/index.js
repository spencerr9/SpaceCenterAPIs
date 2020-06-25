//Environment
require("dotenv").config({
  path: "../.env"
});
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

// var acuity = Acuity.basic({
//   userId: ACUITY_USER_ID,
//   apiKey: ACUITY_API_KEY
// });

//Timing Scripts. 6-HOUR INTERVALS
// getAcuityData();
// setInterval(() => {
//   getAcuityData();
// }, 21600000);

// Acuity Endpoints
let apptData = [];


// 7 Shifts Endpoints
let shiftData = {}; // shiftdata.data now equals shiftDataArr throughout the program
let shiftDataArr = []



app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});