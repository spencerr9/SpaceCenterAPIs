const https = require('https');


let username = "apiToken"
let passw = ""

function doMoreStuff(offset) {
  console.log(offset)
  var options = {
    host: 'api.7shifts.com',
    port: 443,
    path: '/v1/shifts?limit=500&start%5Bgte%5D=2019-09-08&offset=' + offset,
    // authentication headers
    headers: {
      'Authorization': 'Basic ' + new Buffer(username + ':' + passw).toString('base64')
    }
  };
  //this is the call
  request = https.get(options, function(resp) {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => { //Data does not all come at once, it comes piece by piece and this puts those pieces together every time a new one comes in
      data += chunk;
    });

    // The whole response has been received. work with the results
    resp.on('end', () => {
      data = JSON.parse(data);
      console.log(data.data[data.data.length - 1]);
      if (data.data[data.data.length - 1] != undefined) { //This is the base case
        doMoreStuff((offset + 500))
      } else {
        console.log("done") //Once we have confirmed, we have all of our data, we can continue on with the process here...
      }
    });

    //If the response has errored
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
doMoreStuff(0)