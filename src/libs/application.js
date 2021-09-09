const {randomRange, randomStr} = require("./utils");

function generateApplication() {
  return {
    appid: randomRange(1000000, 9999999),
    secret: randomStr(16)
  }
}


module.exports = {
  generateApplication
}
