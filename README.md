## User Stories

(Stretch) As an avid twitter poster,
I want to be able to see how many times my subscribers visit my links
so that I can learn what content they like.

## Display Requirements

# Site Header:

## if a user is logged in, the header shows:
- []the user's email
- [x]a logout button which makes a POST request to /logout
- []if a user is not logged in, the header shows:
- []a link to the login page (/login)
- []a link to the registration page (/register)

 # Behaviour Requirements GET /
 
- ## if user is logged in:
- [](Minor) redirect to /urls
- []if user is not logged in:
- [](Minor) redirect to /login


 # GET /urls
 
- ## if user is logged in:
- []returns HTML with:
- []the site header (see Display Requirements above)
- []a list (or table) of URLs the user has created, each list item - containing:
- [x]a short URL
- [x]the short URL's matching long URL
- [x]an edit button which makes a GET request to /urls/:id
- [x]a delete button which makes a POST request to /urls/:id/delete
- [](Stretch) the date the short URL was created
- [](Stretch) the number of times the short URL was visited
- [](stretch) the number of unique visits for the short URL
- [](Minor) a link to "Create a New Short Link" which makes a GET - request to /urls/new
- []if user is not logged in:
- []returns HTML with a relevant error message


 # GET /urls/new
 
 ## if user is logged in:
- returns HTML with:
- []the site header (see Display Requirements above)
- []a form which contains:
- [x]a text input field for the original (long) URL
- []a submit button which makes a POST request to /urls
- []if user is not logged in:
- []redirects to the /login page
 
 
 #GET /urls/:id
 
 ## if user is logged in and owns the URL for the given ID:
- returns HTML with:
- []the site header (see Display Requirements above)
- []the short URL (for the given ID)
- []a form which contains:
- []the corresponding long URL
- []an update button which makes a POST request to /urls/:id
- [](Stretch) the date the short URL was created
- [](Stretch) the number of times the short URL was visited
- [](Stretch) the number of unique visits for the short URL
- []if a URL for the given ID does not exist:
- [](Minor) returns HTML with a relevant error message
- []if user is not logged in:
- []returns HTML with a relevant error message
- []if user is logged it but does not own the URL with the given ID:
- []returns HTML with a relevant error message
 
 # GET /u/:id
 
- ## if URL for the given ID exists:
- []redirects to the corresponding long URL
- []if URL for the given ID does not exist:
- [](Minor) returns HTML with a relevant error message
 
- # POST /urls
 
 ## if user is logged in:
- []generates a short URL, saves it, and associates it with the user
- []redirects to /urls/:id, where :id matches the ID of the newly - saved []URL
- []if user is not logged in:
- [](Minor) returns HTML with a relevant error message
 
 # POST /urls/:id
 
 ## if user is logged in and owns the URL for the given ID:
- []updates the URL
- []redirects to /urls
- []if user is not logged in:
- [](Minor) returns HTML with a relevant error message
- []if user is logged it but does not own the URL for the given ID:
- [](Minor) returns HTML with a relevant error message
- []POST /urls/:id/delete
- []if user is logged in and owns the URL for the given ID:
- []deletes the URL
- []redirects to /urls
- []if user is not logged in:
- [](Minor) returns HTML with a relevant error message
- []if user is logged it but does not own the URL for the given ID:
- [](Minor) returns HTML with a relevant error message
 
 # GET /login
 
 ## if user is logged in:
- [](Minor) redirects to /urls
- []if user is not logged in:
- []returns HTML with:
- []a form which contains:
- []input fields for email and password
- []submit button that makes a POST request to /login
 
 GET /register
 
- []## if user is logged in:
- [](Minor) redirects to /urls
- []if user is not logged in:
- []returns HTML with:
- []a form which contains:
- []input fields for email and password
- []a register button that makes a POST request to /register
 
 #POST /login
 
 ## if email and password params match an existing user:
- []sets a cookie
- []redirects to /urls
- []if email and password params don't match an existing user:
- []returns HTML with a relevant error message
 
 # POST /register
 
 ## if email or password are empty:
- []returns HTML with a relevant error message
- []if email already exists:
- []returns HTML with a relevant error message
- []otherwise:
- []creates a new user
- []encrypts the new user's password with bcrypt
- []sets a cookie
- []redirects to /urls
 
 # POST /logout
 
 ## deletes cookie
- []redirects to /urls




Basic Permission Features

- Only registered / logged in users can create new tiny URLS
- when someone is not logged in, redirect them to login page

- change the structure of urlDatabase
- when adding to url list, add the userID
- when accessing the url List, access the specific users URL
```
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
```

- anyone can visit SHORT URLS
  - GET /u/:id should work for non users

  