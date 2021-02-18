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
// object placeholder of pre-loaded URLs

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.sorihan.com", userID: "sorihan1988" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "sorihan1988" },
  'a2f747': { longURL: "https://www.enze.com", userID: "user2RandomID" },
  '3f0037': { longURL: "https://www.yahoo.ca", userID: "user2RandomID" }
};

const users = { // USER DATABASE
  "sorihan1988": {
    id: "sorihan1988",
    email: "sori@sorihan.com",
    password: '$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t.'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: '$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t.'
  }
};




// 📗📗📗 GET


// HOME
app.get('/', (req, res) => {
  res.redirect('login');
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



// USER /URLS
app.get('/urls', (req, res) => {
  const id = req.session.user_id;

  if (!id) {
    res.status(403).send('user ID does not exist');
    return;
  }

  const user = users[id];
  if (!user) {
    res.send('please LOG-IN or REGISTER to use TinyApp!'); // or res.redirect(`/login`) 
    return;
  }

  let urls = getUserUrls(urlDatabase, id);
  const templateVars = { urls, user, };
  res.render('urls_index', templateVars);
});



// /URLS/NEW
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    res.status(403).send('user ID does not exist');
    return;
  }

  const user = users[id];
  if (!user) {
    res.redirect(`/login`); // doesn't match /urls which sends a message
  }

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});



// SHOW SPECIFIC URL
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    res.status(403).send('user ID does not exist');
    return;
  }

  const user = users[id];
  if (!user) {
    res.send('please LOG-IN or REGISTER to use TinyApp!'); // or res.redirect(`/login`) 
    return;
  }

  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  if (!urlRecord) {
    res.send('this short URL does not exist! 🤷🏽‍♂️');
    return;
  }

  if (urlRecord.userID !== id) {
    res.send('this URL does not belong to you 🙅🏻‍♂️');
    return;
  }

  const longURL = urlRecord.longURL
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




// ✏️ ✏️ ✏️  POST


// LOGIN / LOGOUT 🔑
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email);
  const passwordCheck = bcrypt.compareSync(password, user.password);
  if (!user || !passwordCheck) {
    res.status(403).send('wrong credentials');
    return;
  }

  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});



// /REGISTER
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === '' || password === '') {
    res.sendStatus(400);
    return;
  } else if (getUserByEmail(users, email).email) { //TODO may need to use the new GETUSERBYEMAIL helper function
    res.send('this email already exists!');
    return;
  }

  req.session.user_id = userID;
  users[userID] = { id: userID, email, password };
  res.redirect(`/urls`);
});



// SUBMIT NEW LONG-URL
app.post("/urls", (req, res) => {
  let { longURL } = req.body;

  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }

  const id = req.session.user_id;
  const genShortURL = generateRandomString();
  urlDatabase[genShortURL] = { longURL, userID: id };
  res.redirect(`/urls/${genShortURL}`);
});



// DELETE EXISTING URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const { shortURL } = req.params;
  if (id !== urlDatabase[shortURL].userID) {
    res.sendStatus(404);
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});



// UPDATE EXISTING URL
app.post("/urls/:shortURL/update", (req, res) => {
  const id = req.session.user_id;
  const { longURL } = req.body;
  const { shortURL } = req.params;
  if (id !== urlDatabase[shortURL].userID) {
    res.sendStatus(404);
    return;
  }

  urlDatabase[shortURL] = { longURL, userID: id };
  res.redirect(`/urls`);
});







app.listen(PORT, () => {
  console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ tinyapp is running on PORT: ${PORT}`);
});