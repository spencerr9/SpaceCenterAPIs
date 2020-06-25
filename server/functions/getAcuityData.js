function getAcuityData() {
    acuity.request(
        `/appointments?max=1000&direction=ASC&minDate=${getFormattedDateQueryParam(
        new Date()
      )}`,
        function (err, res, appointments) {
            // acuity.request("/appointments/309167140", function(err, res, appointments) {
            if (err) return console.error(err);
            console.log("APPOINTMENTS:", appointments.length);
            console.log(`CYCLE TIME: ${new Date()}`);
            apptData = appointments;
            getSevenShiftsData();
        }
    );
}