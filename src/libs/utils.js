function randomRange(myMin, myMax) {
  return Math.floor(Math.random()*(myMax - myMin + 1)) + myMin;
}

function randomStr(len = 6) {
  let map = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < len; i++) {
    str += map.substr(randomRange(0, 26), 1)
  }
  return str
}

module.exports = {
  randomRange,
  randomStr
}
