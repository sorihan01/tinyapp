[1mdiff --git a/express_server.js b/express_server.js[m
[1mindex 17ee6da..247ab25 100644[m
[1m--- a/express_server.js[m
[1m+++ b/express_server.js[m
[36m@@ -8,12 +8,15 @@[m [mconst PORT = 8080;[m
 [m
 const bodyParser = require("body-parser");[m
 const morgan = require('morgan');[m
[31m-const cookieParser = require('cookie-parser');[m
[32m+[m[32mvar cookieSession = require('cookie-session')[m
 const bcrypt = require('bcrypt');[m
 app.use(bodyParser.urlencoded({ extended: true })); //formats the form POST requests[m
 app.set("view engine", "ejs");[m
 app.use(morgan('dev'));[m
[31m-app.use(cookieParser());[m
[32m+[m[32mapp.use(cookieSession({[m
[32m+[m[32m  name: 'session',[m
[32m+[m[32m  keys: ['hamilton', 'biminibonboulash'][m
[32m+[m[32m}))[m
 [m
 // helper functions[m
 [m
[36m@@ -73,7 +76,7 @@[m [mapp.get('/login', (req, res) => {[m
 [m
 // USER /URLS[m
 app.get('/urls', (req, res) => {[m
[31m-  const id = req.cookies['user_id'];[m
[32m+[m[32m  const id = req.session.user_id;[m
   const user = users[id];[m
   let userUrls = getUserUrls(urlDatabase, id);[m
   if (user) {[m
[36m@@ -89,10 +92,10 @@[m [mapp.get('/urls', (req, res) => {[m
 [m
 // /URLS/NEW[m
 app.get("/urls/new", (req, res) => {[m
[31m-  const id = req.cookies['user_id'];[m
[32m+[m[32m  const id = req.session.user_id;[m
   const user = users[id];[m
   if (user) {[m
[31m-    const id = req.cookies['user_id'];[m
[32m+[m[32m    // const id = req.cookies['user_id'];[m
     const user = users[id];[m
     const templateVars = {[m
       user[m
[36m@@ -105,7 +108,7 @@[m [mapp.get("/urls/new", (req, res) => {[m
 [m
 // SHOW SPECIFIC URL[m
 app.get('/urls/:shortURL', (req, res) => {[m
[31m-  const id = req.cookies['user_id'];[m
[32m+[m[32m  const id = req.session.user_id;[m
   const user = users[id];[m
   const reqShortURL = req.params.shortURL[m
   if (urlDatabase[reqShortURL].userID === id) {[m
[36m@@ -127,12 +130,10 @@[m [mapp.get('/urls/:shortURL', (req, res) => {[m
 // REDIRECT TO ORIGINAL LONG-URL PAGE[m
 app.get("/u/:shortURL", (req, res) => {[m
   const shortURL = urlDatabase[req.params.shortURL];[m
[31m-  console.log('line 130 shortURL: ' + req.params.shortURL) //shows as [m
   if (!shortURL) {[m
     res.send('this short URL does not exist!');[m
   } else {[m
     const longURL = shortURL.longURL;[m
[31m-    console.log('line135 long URL: ' + longURL)[m
     res.redirect(longURL);[m
   }[m
 });[m
[36m@@ -148,8 +149,7 @@[m [mapp.post("/login", (req, res) => {[m
   const password = req.body.password;[m
   const loginUserID = fetchUserID(users, email);[m
   if (emailExists(users, email) && bcrypt.compareSync(password, users[loginUserID].password)) {[m
[31m-    console.log(users[loginUserID].password)[m
[31m-    res.cookie('user_id', loginUserID);[m
[32m+[m[32m    req.session.user_id = loginUserID;[m
     res.redirect(`/urls`);[m
   } else {[m
     res.sendStatus(403);[m
[36m@@ -157,7 +157,7 @@[m [mapp.post("/login", (req, res) => {[m
 });[m
 [m
 app.post("/logout", (req, res) => {[m
[31m-  res.clearCookie('user_id'); //, {path: '/'}[m
[32m+[m[32m  req.session = null;[m
   res.redirect(`/login`);[m
 });[m
 [m
[36m@@ -166,13 +166,11 @@[m [mapp.post("/register", (req, res) => {[m
   const userID = generateRandomString();[m
   const email = req.body.email;[m
   const password = bcrypt.hashSync(req.body.password, 10); // this works[m
[31m-  // console.log('this is password ' + password)[m
   if (emailExists(users, email) || email === '' || password === '') {[m
     res.sendStatus(400);[m
   }[m
[31m-  res.cookie('user_id', userID);[m
[32m+[m[32m  req.session.user_id = userID;[m
   users[userID] = { id: userID, email, password };[m
[31m-  // console.log('users in file: ' + users)[m
   res.redirect(`/urls`);[m
 });[m
 [m
[36m@@ -183,16 +181,15 @@[m [mapp.post("/urls", (req, res) => {[m
   if (!reqLongURL.startsWith('http')) {[m
     reqLongURL = `http://${reqLongURL}`;[m
   }[m
[31m-  const id = req.cookies['user_id'];[m
[32m+[m[32m  const id = req.session.user_id;[m
   const genShortURL = generateRandomString();[m
   urlDatabase[genShortURL] = { longURL: reqLongURL, userID: id };[m
[31m-  console.log(urlDatabase)[m
   res.redirect(`/urls/${genShortURL}`);[m
 });[m
 [m
 // DELETE EXISTING URL[m
 app.post("/urls/:shortURL/delete", (req, res) => {[m
[31m-  const id = req.cookies['user_id'];[m
[32m+[m[32m  const id = req.session.user_id;[m
   const { shortURL } = req.params;[m
   if (id === urlDatabase[shortURL].userID) {[m
     delete urlDatabase[shortURL];[m
[36m@@ -205,12 +202,11 @@[m [mapp.post("/urls/:shortURL/delete", (req, res) => {[m
 // UPDATE EXISTING URL[m
 app.post("/urls/:shortURL/update", (req, res) => {[m
   const longURL = req.body.longURL;[m
[31m-  const id = req.cookies['user_id'];[m
[32m+[m[32m  const id = req.session.user_id;[m
   const { shortURL } = req.params;[m
   if (id === urlDatabase[shortURL].userID) {[m
     urlDatabase[shortURL] = { longURL, userID: id };[m
[31m-    console.log(urlDatabase)[m
[31m-    res.cookie;[m
[32m+[m[32m    // res.cookie;[m
     res.redirect(`/urls`);[m
   } else {[m
     res.sendStatus(404);[m
[1mdiff --git a/package-lock.json b/package-lock.json[m
[1mindex f1ba4b5..e72cff8 100644[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@ -11,6 +11,7 @@[m
         "bcrypt": "2.0.0",[m
         "body-parser": "^1.19.0",[m
         "cookie-parser": "^1.4.5",[m
[32m+[m[32m        "cookie-session": "^1.4.0",[m
         "ejs": "^3.1.6",[m
         "express": "^4.17.1",[m
         "morgan": "^1.10.0"[m
[36m@@ -555,11 +556,41 @@[m
         "node": ">= 0.8.0"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/cookie-session": {[m
[32m+[m[32m      "version": "1.4.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/cookie-session/-/cookie-session-1.4.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-0hhwD+BUIwMXQraiZP/J7VP2YFzqo6g4WqZlWHtEHQ22t0MeZZrNBSCxC1zcaLAs8ApT3BzAKizx9gW/AP9vNA==",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "cookies": "0.8.0",[m
[32m+[m[32m        "debug": "2.6.9",[m
[32m+[m[32m        "on-headers": "~1.0.2"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/cookie-signature": {[m
       "version": "1.0.6",[m
       "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.6.tgz",[m
       "integrity": "sha1-4wOogrNCzD7oylE6eZmXNNqzriw="[m
     },[m
[32m+[m[32m    "node_modules/cookies": {[m
[32m+[m[32m      "version": "0.8.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/cookies/-/cookies-0.8.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-8aPsApQfebXnuI+537McwYsDtjVxGm8gTIzQI3FDW6t5t/DAhERxtnbEPN/8RX+uZthoz4eCOgloXaE5cYyNow==",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "depd": "~2.0.0",[m
[32m+[m[32m        "keygrip": "~1.1.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">= 0.8"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/cookies/node_modules/depd": {[m
[32m+[m[32m      "version": "2.0.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">= 0.8"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/core-util-is": {[m
       "version": "1.0.2",[m
       "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",[m
[36m@@ -1250,6 +1281,17 @@[m
       "integrity": "sha1-Wx85evx11ne96Lz8Dkfh+aPZqJg=",[m
       "dev": true[m
     },[m
[32m+[m[32m    "node_modules/keygrip": {[m
[32m+[m[32m      "version": "1.1.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/keygrip/-/keygrip-1.1.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-iYSchDJ+liQ8iwbSI2QqsQOvqv58eJCEanyJPJi+Khyu8smkcKSFUCbPwzFcL7YVtZ6eONjqRX/38caJ7QjRAQ==",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "tsscmp": "1.0.6"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">= 0.6"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/keyv": {[m
       "version": "3.1.0",[m
       "resolved": "https://registry.npmjs.org/keyv/-/keyv-3.1.0.tgz",[m
[36m@@ -2156,6 +2198,14 @@[m
         "nodetouch": "bin/nodetouch.js"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/tsscmp": {[m
[32m+[m[32m      "version": "1.0.6",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/tsscmp/-/tsscmp-1.0.6.tgz",[m
[32m+[m[32m      "integrity": "sha512-LxhtAkPDTkVCMQjt2h6eBVY28KCjikZqZfMcC15YBeNjkgUpdCfBu5HoiOTDu86v6smE8yOjyEktJ8hlbANHQA==",[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=0.6.x"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/type-fest": {[m
       "version": "0.8.1",[m
       "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.8.1.tgz",[m
[36m@@ -2854,11 +2904,37 @@[m
         "cookie-signature": "1.0.6"[m
       }[m
     },[m
[32m+[m[32m    "cookie-session": {[m
[32m+[m[32m      "version": "1.4.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/cookie-session/-/cookie-session-1.4.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-0hhwD+BUIwMXQraiZP/J7VP2YFzqo6g4WqZlWHtEHQ22t0MeZZrNBSCxC1zcaLAs8ApT3BzAKizx9gW/AP9vNA==",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "cookies": "0.8.0",[m
[32m+[m[32m        "debug": "2.6.9",[m
[32m+[m[32m        "on-headers": "~1.0.2"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "cookie-signature": {[m
       "version": "1.0.6",[m
       "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.6.tgz",[m
       "integrity": "sha1-4wOogrNCzD7oylE6eZmXNNqzriw="[m
     },[m
[32m+[m[32m    "cookies": {[m
[32m+[m[32m      "version": "0.8.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/cookies/-/cookies-0.8.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-8aPsApQfebXnuI+537McwYsDtjVxGm8gTIzQI3FDW6t5t/DAhERxtnbEPN/8RX+uZthoz4eCOgloXaE5cYyNow==",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "depd": "~2.0.0",[m
[32m+[m[32m        "keygrip": "~1.1.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "depd": {[m
[32m+[m[32m          "version": "2.0.0",[m
[32m+[m[32m          "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",[m
[32m+[m[32m          "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw=="[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "core-util-is": {[m
       "version": "1.0.2",[m
       "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",[m
[36m@@ -3397,6 +3473,14 @@[m
       "integrity": "sha1-Wx85evx11ne96Lz8Dkfh+aPZqJg=",[m
       "dev": true[m
     },[m
[32m+[m[32m    "keygrip": {[m
[32m+[m[32m      "version": "1.1.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/keygrip/-/keygrip-1.1.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-iYSchDJ+liQ8iwbSI2QqsQOvqv58eJCEanyJPJi+Khyu8smkcKSFUCbPwzFcL7YVtZ6eONjqRX/38caJ7QjRAQ==",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "tsscmp": "1.0.6"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "keyv": {[m
       "version": "3.1.0",[m
       "resolved": "https://registry.npmjs.org/keyv/-/keyv-3.1.0.tgz",[m
[36m@@ -4109,6 +4193,11 @@[m
         "nopt": "~1.0.10"[m
       }[m
     },[m
[32m+[m[32m    "tsscmp": {[m
[32m+[m[32m      "version": "1.0.6",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/tsscmp/-/tsscmp-1.0.6.tgz",[m
[32m+[m[32m      "integrity": "sha512-LxhtAkPDTkVCMQjt2h6eBVY28KCjikZqZfMcC15YBeNjkgUpdCfBu5HoiOTDu86v6smE8yOjyEktJ8hlbANHQA=="[m
[32m+[m[32m    },[m
     "type-fest": {[m
       "version": "0.8.1",[m
       "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.8.1.tgz",[m
[1mdiff --git a/package.json b/package.json[m
[1mindex 73173ee..afabd84 100644[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@ -22,6 +22,7 @@[m
     "bcrypt": "2.0.0",[m
     "body-parser": "^1.19.0",[m
     "cookie-parser": "^1.4.5",[m
[32m+[m[32m    "cookie-session": "^1.4.0",[m
     "ejs": "^3.1.6",[m
     "express": "^4.17.1",[m
     "morgan": "^1.10.0"[m
