function getSevenShiftsData(offset) {
    offset = typeof offset !== 'undefined' ? offset : 0
    svnShifts.Shifts.list(SVNSHIFTS_API_KEY, offset)
        .then(function (resp) {
            shiftData = JSON.parse(resp.body)
            console.log('totalShifts', shiftData.data.length);
            shiftDataArr.push(shiftData.data)
        })
        .then(function () {
            shiftDataArr = [].concat.apply([], shiftDataArr)
            console.log('shiftDataArr', shiftDataArr.length)
            if (offset < 501) {
                console.log('offset', offset)
                // console.log(shiftDataArr)
                return getSevenShiftsData(offset + 500)
            } else {
                processData();
                return shiftDataArr
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}