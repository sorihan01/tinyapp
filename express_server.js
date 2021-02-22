// run server: npm start

const express = require("express");
const app = express();
const PORT = 8080;

// middleware

const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true })); //formats the form POST requests
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['hamilton', 'biminibonboulash']
}));

// helper functions

const { getUserByEmail, generateRandomString, getUserUrls } = require('./helpers/userHelpers');

// 🌍 GLOBAL SCOPE VARIABLES

const urlDatabase = { // URL DATABASE
  b6UTxQ: { longURL: "https://www.sorihan.com", userID: "sorihan1988" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "sorihan1988" },
  'a2f747': { longURL: "https://www.enze.com", userID: "user2RandomID" },
  '3f0037': { longURL: "https://www.yahoo.ca", userID: "user2RandomID" }
};

const users = { // USER DATABASE
  "sorihan1988": {
    userID: "sorihan1988",
    email: "sori@sorihan.com",
    password: '$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t.'
  },
  "user2RandomID": {
    userID: "user2RandomID",
    email: "user2@example.com",
    password: '$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t.'
  }
};



// 📗 GET

// HOME
app.get('/', (req, res) => {
  res.redirect('login');
});



// REGISTER page renders if userId does not exist
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const templateVars = {
      user: null
    };
    res.render('register', templateVars);
    return;
  }

  res.redirect('/urls')
});



// LOGIN if userID/ cookie does not exist render login page. Redirec to /urls if logged in.
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const templateVars = {
      user: null
    };
    res.render('login', templateVars);
    return;
  }

  res.redirect('/urls')
});



// USER /URLS - only logged in users can view this page.
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.status(403).send('please LOG-IN or REGISTER to use TinyApp!');
    return;
  }

  const user = users[userID];
  if (!user) {
    res.status(403).send('please LOG-IN or REGISTER to use TinyApp!');
    return;
  }

  let urls = getUserUrls(urlDatabase, userID);
  const templateVars = { urls, user, };
  res.render('urls_index', templateVars);
});



// /URLS/NEW - logged in users can create new URLs
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.status(403).send('please LOG-IN or REGISTER to use TinyApp!');
    return;
  }

  const user = users[userID];
  if (!user) {
    res.redirect(`/login`);
    return;
  }

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});



//  Logged in users can access their shortURL to edit or visit the page
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.status(403).send('please LOG-IN or REGISTER to use TinyApp!');
    return;
  }

  const user = users[userID];
  if (!user) {
    res.send('please LOG-IN or REGISTER to use TinyApp!'); 
    return;
  }

  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  if (!urlRecord) {
    res.send('this short URL does not exist! 🤷🏽‍♂️');
    return;
  }

  if (urlRecord.userID !== userID) {
    res.send('this URL does not belong to you 🙅🏻‍♂️');
    return;
  }

  const longURL = urlRecord.longURL;
  const templateVars = { shortURL, longURL, user };
  res.render('urls_show', templateVars);
});



// REDIRECT TO ORIGINAL LONG-URL PAGE
app.get("/u/:shortURL", (req, res) => {
  const urlRecord = urlDatabase[req.params.shortURL];
  if (!urlRecord) {
    res.send('this short URL does not exist 🤡');
    return;
  }

  res.redirect(urlRecord.longURL);
});



// ✏️ POST

// LOGIN / LOGOUT 🔑 - Checks credential for existing user to log in. Redirects to user's URLs
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status(403).send('wrong credentials');
    return;
  }

  const user = getUserByEmail(users, email);
  if (!user) {
    res.status(403).send('invalid credentials');
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('invalid credentials');
    return;
  }

  req.session.user_id = user.userID;
  res.redirect(`/urls`);
});



app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});



// /REGISTER - Registration is successful if email doesn't exist in database
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === '' || password === '') {
    res.status(400).send("please check your email or password");
    return;
  }

  if (!getUserByEmail(users, email)) {
    const userID = generateRandomString();
    req.session.user_id = userID;
    users[userID] = { userID, email, password };
    res.redirect(`/urls`);
  }

  res.send('this email already exists!');
  return;
});



// SUBMIT NEW LONG-URL - stores new URL in database of user and adds URL prefix if non-existent
app.post("/urls", (req, res) => {
  let { longURL } = req.body;

  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }

  const userID = req.session.user_id;
  const genShortURL = generateRandomString();
  urlDatabase[genShortURL] = { longURL, userID, };
  res.redirect(`/urls/${genShortURL}`);
});



// DELETE EXISTING URL - owner of existing URL can delete their stored URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const { shortURL } = req.params;
  if (userID !== urlDatabase[shortURL].userID) {
    res.sendStatus(404);
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});



// EDIT EXISTING URL - owner if URL can edit URL. If no prefix for URL is given adds correct prefix
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  let { longURL } = req.body;
  const { shortURL } = req.params;

  if (userID !== urlDatabase[shortURL].userID) {
    res.status(404).send('You do not have permission to  edit this link');
    return;
  }
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }

  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls`);
});



app.listen(PORT, () => {
  console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧✧✧ TinyApp is running on PORT: ${PORT} ☆☆☆ﾐ(o*･ω･)ﾉ	`);
}); 