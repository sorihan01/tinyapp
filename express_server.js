//You can run me using npm start

const express = require("express");
const app = express();
const PORT = 8080;

//middleware
const bodyParser = require("body-parser");
const morgan = require('morgan');
app.use(bodyParser.urlencoded({ extended: true })); //formats the form POST requests
app.set("view engine", "ejs");
app.use(morgan('dev'));


app.get("/", (req, res) => {
  res.send("Hello!");
});

// object placeholder of pre-loaded URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate random string of 6 characters
const generateRandomString = () => {
  const crypto = require("crypto");
  const id = crypto.randomBytes(3).toString('hex');
  return id;
};

/*  ❕ keep in mind that routes should be ordered from most specific to least specific ❕  */

// get /urls...
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// POST
// user submits longURL
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase); // log updated object
  res.redirect(`/urls/${shortURL}`);
});
// user clicks on DELETE button
app.post("/urls/:shortURL/delete", (req, res) => {
  let {shortURL} = req.params
delete urlDatabase[shortURL]
  console.log(urlDatabase); // log updated object
  res.redirect(`/urls`);
});


/* specific shortURL GET*/
app.get('/urls/:shortURL', (req, res) => {

  if (req.params.shortURL in urlDatabase) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
  } else {
    //if the shortURL does not exist, redirects to form
    res.send('this short URL does not exist! 🤷🏽‍♂️');
  }
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});







app.listen(PORT, () => {
  console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ tinyapp is running on PORT: ${PORT}`)
});