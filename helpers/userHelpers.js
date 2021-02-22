const crypto = require("crypto");



// generates code for userID and shortURL link
const generateRandomString = () => crypto.randomBytes(3).toString('hex');



//retrieves user by email
const getUserByEmail = (database, email) => {
  let user = {};

  for (let key in database) {
    if (database[key]['email'] === email) {
      user = database[key];
      return user;
    }
  }

  return null;
};




// Returns the user's URLs
const getUserUrls = (urlDatabase, userID) => {
  let userUrls = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userUrls[key] = urlDatabase[key];
    }
  }
  
  return userUrls;
};




module.exports = { getUserByEmail, generateRandomString, getUserUrls };
