const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true })); //formats the form POST requests
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

// object placeholder of predetermined URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate random string of 6 characters
const generateRandomString = () => {
  var crypto = require("crypto");
  var id = crypto.randomBytes(3).toString('hex');
  return id
};

/*
 ❕ keep in mind that routes should be ordered from most specific to least specific ❕ 
*/

// get /urls

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// POST - user submits long URL
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);  // log the updated object
  res.redirect(`/urls/${shortURL}`);
});

/* specific shortURL GET*/
app.get('/urls/:shortURL', (req, res) => {

  if (req.params.shortURL in urlDatabase) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
  } else {
    //if the shortURL does not exist, redirects to form
    res.redirect('/urls/new')
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});