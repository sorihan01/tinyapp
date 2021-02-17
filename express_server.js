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

const { generateRandomString, emailExists, passwordMatching, fetchUserID } = require('./helpers/userHelpers');






// 🌍 GLOBAL SCOPE VARIABLES
// object placeholder of pre-loaded URLs

const urlDatabase = { // URL DATABASE
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { // USER DATABASE
  "sorihan1988": {
    id: "sorihan1988",
    email: "sori@sorihan.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}





// 📗📗📗 GET

// HOME
app.get('/', (req, res) => {
  res.redirect('login')
});

// REGISTER
app.get('/register', (req, res) => {
  const templateVars = {
    user: null
  };
  res.render('register', templateVars);
});

// LOGIN
app.get('/login', (req, res) => {
  const templateVars = {
    user: null
  };
  res.render('login', templateVars);
});

// /URLS
app.get('/urls', (req, res) => {
  if (req.cookies) {
    const id = req.cookies['user_id'];
    const user = users[id];
    const templateVars = {
      urls: urlDatabase,
      user,
    };
    res.render('urls_index', templateVars);
  } else {
    res.send('no email')
  }
});

// /URLS/NEW
app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id'];
  const user = users[id];
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

// SHOW SPECIFIC URL
app.get('/urls/:shortURL', (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    const id = req.cookies['user_id'];
    const user = users[id];
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('this short URL does not exist! 🤷🏽‍♂️'); //TODO redirect button
  }
});

// REDIRECT TO ORIGINAL PAGE
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});




// ✏️ ✏️ ✏️  POST

// LOGIN / LOGOUT 🔑
app.post("/login", (req, res) => {
const email = req.body.email;
const password = req.body.password;
if(emailExists(users, email) && passwordMatching(users, password)) {
  res.cookie('user_id', fetchUserID(users, email));
  // console.log('email: ' + email + ' pswrd: ' + password)
  res.redirect(`/urls`);
} else{
  // console.log('NO USER!! email: ' + email + ' pswrd: ' + password)
  res.sendStatus(403);
}
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); //, {path: '/'}
  res.redirect(`/urls`);
});

// /REGISTER
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (emailExists(users, email) || email === '' || password === '' ) {
    res.sendStatus(400);
  }

  res.cookie('user_id', userID);
  users[userID] = { id: userID, email, password }

  // console.log(userID)
  // console.log()
  // console.log(users)

  res.redirect(`/urls`);
});

// SUBMIT NEW LONG-URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// DELETE EXISTING URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params
  delete urlDatabase[shortURL]
  res.redirect(`/urls`);
});

// UPDATE EXISTING URL
app.post("/urls/:shortURL/update", (req, res) => {
  const { shortURL } = req.params;
  urlDatabase[shortURL] = req.body.longURL;
  res.cookie
  res.redirect(`/urls`);
});






app.listen(PORT, () => { console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ tinyapp is running on PORT: ${PORT}`) });