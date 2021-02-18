// run server: npm start

const express = require("express");
const app = express();
const PORT = 8080;

// middleware

const bodyParser = require("body-parser");
const morgan = require('morgan');
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true })); //formats the form POST requests
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['hamilton', 'biminibonboulash']
}))

// helper functions

const { generateRandomString, emailExists, fetchUserID, getUserUrls } = require('./helpers/userHelpers');






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
  const user = users[id];
  let userUrls = getUserUrls(urlDatabase, id);
  if (user) {
    const templateVars = {
      urls: userUrls,
      user,
    };
    res.render('urls_index', templateVars);
  } /*else {*/
    res.send('please LOG-IN or REGISTER to use TinyApp!');
  /*}*/
});

// /URLS/NEW
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    // const id = req.cookies['user_id'];
    const user = users[id];
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

// SHOW SPECIFIC URL
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const reqShortURL = req.params.shortURL
  if (urlDatabase[reqShortURL].userID === id) {
    if (reqShortURL in urlDatabase) {
      const templateVars = {
        shortURL: reqShortURL,
        longURL: urlDatabase[reqShortURL].longURL,
        user
      };
      res.render('urls_show', templateVars);
    } else {
      res.send('this short URL does not exist! 🤷🏽‍♂️'); //TODO redirect button
    }
  } else {
    res.send('this URL does not belong to you 🙅🏻‍♂️');
  }
});

// REDIRECT TO ORIGINAL LONG-URL PAGE
app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    res.send('this short URL does not exist!');
  } else {
    const longURL = shortURL.longURL;
    res.redirect(longURL);
  }
});




// ✏️ ✏️ ✏️  POST

// LOGIN / LOGOUT 🔑
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const loginUserID = fetchUserID(users, email);
  if (emailExists(users, email) && bcrypt.compareSync(password, users[loginUserID].password)) {
    req.session.user_id = loginUserID;
    res.redirect(`/urls`);
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// /REGISTER
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10); // this works
  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (emailExists(users, email)){
    res.send('this email already exists!');
  }
  req.session.user_id = userID;
  users[userID] = { id: userID, email, password };
  res.redirect(`/urls`);
});

// SUBMIT NEW LONG-URL
app.post("/urls", (req, res) => {
  let reqLongURL = req.body.longURL;
  //adds http:// to new URL as URL w/o http:// will not redirect properly
  if (!reqLongURL.startsWith('http')) {
    reqLongURL = `http://${reqLongURL}`;
  }
  const id = req.session.user_id;
  const genShortURL = generateRandomString();
  urlDatabase[genShortURL] = { longURL: reqLongURL, userID: id };
  res.redirect(`/urls/${genShortURL}`);
});

// DELETE EXISTING URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const { shortURL } = req.params;
  if (id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.sendStatus(404);
  }
});

// UPDATE EXISTING URL
app.post("/urls/:shortURL/update", (req, res) => {
  const longURL = req.body.longURL;
  const id = req.session.user_id;
  const { shortURL } = req.params;
  if (id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = { longURL, userID: id };
    // res.cookie;
    res.redirect(`/urls`);
  } else {
    res.sendStatus(404);
  }
});







app.listen(PORT, () => {
  console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ tinyapp is running on PORT: ${PORT}`);
});