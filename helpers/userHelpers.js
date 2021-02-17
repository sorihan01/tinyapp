// functions live here

//random string generator
const crypto = require("crypto");

const generateRandomString = () => crypto.randomBytes(3).toString('hex');

const emailExists = (database, email) => {
  for (let key in database) {
    return (database[key]["email"] === email) ? true : false;
  }
};

const passwordMatching = (database, password) => {
  for (let key in database) {
    return (database[key]["password"] === password) ? true : false;
  }
};

const fetchUserID = (database, email) => {
  for (let key in database) {
    return (database[key]["email"] === email) ? database[key].id : false;
  }
};

module.exports = { generateRandomString, emailExists, passwordMatching, fetchUserID };
