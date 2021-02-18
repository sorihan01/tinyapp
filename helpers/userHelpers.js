// functions live here
const crypto = require("crypto");

// generates code for userID and shortURL link
const generateRandomString = () => crypto.randomBytes(3).toString('hex');

// checks for email in database
const emailExists = (database, email) => {
  for (let key in database) {
    if (database[key]["email"] === email) {
      return true;
    }
  }
};

// using the req.params.email, we fetch the userID
const fetchUserID = (database, email) => {
  for (let key in database) {
    if (database[key]["email"] === email) {
      return database[key].id;
    }
  }
};

// Returns only URLS with current userID
const getUserUrls = (urlDatabase, userID) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, emailExists, fetchUserID, getUserUrls };
