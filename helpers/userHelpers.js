// functions live here

//random string generator
const crypto = require("crypto");

const generateRandomString = () => crypto.randomBytes(3).toString('hex');

const emailExists = (database, email) => {
  for (let key in database) {
    return (database[key]["email"] === email) ? true : false;
  }
};

const passwordMatching = (database, email, password) => (database[email].password === password) ? true : false;

const fetchUser = (database, email) => database[email] ? database[email] : {};




module.exports = { generateRandomString, emailExists, passwordMatching, fetchUser };
