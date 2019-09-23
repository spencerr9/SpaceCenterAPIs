let timesToRun = 5
let arr = []

let countdown = function(value){
    if(value > 0){
        console.log(value)
        arr.push(value)
        console.log(arr)
        return countdown(value-1)
    } else {
        return arr
    }
}

console.log(countdown(timesToRun))

function countTo(val){
    if(val < 10){
        console.log(val)
        return countTo(val + 1)
    } else {
        return val
    }
}

console.log(countTo(0))