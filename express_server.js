// run server: npm start

const express = require("express");
const app = express();
const PORT = 8080;

// middleware

const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({ extended: true })); //formats the form POST requests
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieParser());

// helper functions

const {generateRandomString, emailExists, passwordMatching, fetchUser} = require('./helpers/userHelpers');

// 🌍 GLOBAL SCOPE VARIABLES
// object placeholder of pre-loaded URLs

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// 🔑  LOGIN / LOGOUT 🔑 

// users object

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// LOGIN / LOGOUT post 

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie('user_id', username)
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); //, {path: '/'}
  res.redirect(`/urls`);
});

// REGISTER get and post

app.get('/', (req, res) => {
  res.send('please log in')
});


app.get('/register', (req, res) => {
  // const isLoggedIn = req.cookies.user_id ? true : false ;
  // const id = req.cookie['user_id'];
  // const user = users[id];
  const templateVars = {
    // user_id: null,
    user: null
    // urls: urlDatabase,
    // email: user.email,
    // isLoggedIn,
  };
  res.render('register', templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  res.cookie('user_id', userID); //  res.cookie('user_id', userID);
  const email = req.body.email;
  const password = req.body.password;
  users[userID] = {id: userID, email, password}
  console.log(userID)
  console.log()
  console.log(users)
  //check if email exists
  //if not add the new user data to the database
  //redirect them to /urls if everything is ok
  // req.cookie.user_id = userID; 
res.redirect(`/urls`);
});


//  ❗️ routes should be ordered from most specific to least specific ❗️

// 📗  get 📗

app.get('/urls', (req, res) => {

  console.log(req.cookies)
  // const isLoggedIn = req.cookies.user_id ? true : false ;

if(req.cookies) {

  const id = req.cookies['user_id'];
  const user = users[id];
  const templateVars = {
    urls: urlDatabase,
    // email: user['email'],
    user_id: id,
    user,
    // isLoggedIn
  };
  res.render('urls_index', templateVars);
} else {
  res.send('no email')
}


});
app.get("/urls/new", (req, res) => {
  // const isLoggedIn = req.cookies.user_id ? true : false ;
  const id = req.cookies['user_id'];
  const user = users[id];
  const templateVars = {
    // email: user.email,
    // isLoggedIn,
    user
  };
  res.render("urls_new", templateVars);
});


// when using pre-stored user, I can log in
// I can't seem to load page if email of user doesn't exist


// ✏️  post ✏️

// user submits longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
// user clicks on DELETE button
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params
  delete urlDatabase[shortURL]
  res.redirect(`/urls`);
});
// user clicks on UPDATE button
app.post("/urls/:shortURL/update", (req, res) => {
  // this line is same as req.params.shortURL
  const { shortURL } = req.params;
  //update the key value with the new body
  urlDatabase[shortURL] = req.body.longURL;
  res.cookie
  res.redirect(`/urls`);
});


/* ❇️  specific shortURL GET*/
app.get('/urls/:shortURL', (req, res) => {
  // const isLoggedIn = req.cookies.user_id ? true : false ;
  if (req.params.shortURL in urlDatabase) {
    const id = req.cookies['user_id'];
    const user = users[id];
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user
      // email: user.email,
      // isLoggedIn
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('this short URL does not exist! 🤷🏽‍♂️'); //TODO redirect button
  }
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// all the gets together and posts together


app.listen(PORT, () => { console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ tinyapp is running on PORT: ${PORT}`) });