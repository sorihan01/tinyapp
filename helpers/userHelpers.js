// functions live here

//random string generator
const crypto = require("crypto");

const generateRandomString = () => crypto.randomBytes(3).toString('hex');

const emailExists = (database, email) => {
  for (let key in database) {
    if (database[key]["email"] === email) {
      return true;
    }
  }
};

const passwordMatching = (database, password) => {
  for (let key in database) {
    if (database[key]["password"] === password) {
      return true;
    }
  }
};

const fetchUserID = (database, email) => {
  for (let key in database) {
    if (database[key]["email"] === email) {
      return database[key].id;
    }
  }
};

const getUserUrls = (urlDatabase, userID) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, emailExists, passwordMatching, fetchUserID, getUserUrls };
