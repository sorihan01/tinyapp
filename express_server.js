const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true})); //formats the form POST requests
app.set("view engine", "ejs")

app.get("/", (req, res) => {
  res.send("Hello!");
});

// object placeholder of predetermined URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate random string of 6 characters
function generateRandomString() {
  var crypto = require("crypto");
var id = crypto.randomBytes(3).toString('hex');
return id
}
console.log(generateRandomString())



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


app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

// post /urls

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});



// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});