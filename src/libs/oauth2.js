const { v4: uuidv4 } = require('uuid');

function generateTempCode() {
  return uuidv4();
}


function generateAccessToken() {
  return {
    accessToken: uuidv4(),
    expireIn: 7200
  };
}

module.exports = {
  generateTempCode,
  generateAccessToken
}
