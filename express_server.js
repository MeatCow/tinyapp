require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const { renderError, generateRandomString, prefixURL } = require('./lib/utils');
const { UserDatabase } = require('./lib/UserDatabase');
const { URLDatabase } = require('./lib/URLDatabase');
const { SESSION_SECRET } = process.env;

const PORT = 8080;

const app = express();
const usersDatabase = new UserDatabase();
const urlDatabase = new URLDatabase();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "userId",
  secret: SESSION_SECRET
}));

app.use((req, res, next) => {
  req.user = usersDatabase.findById(req.session.userId);
  next();
});

const isLoggedIn = (request) => {
  const id = request.session.userId;
  if (usersDatabase.findById(id)) {
    return true;
  }
  if (id !== undefined) {
    request.session = null;
  }
  return false;
};

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  let urlObj = urlDatabase.urls[shortURL];

  if (!urlObj) {
    return renderError(req, res, "Resource does not exists", 404);
  }
  res.redirect(urlObj.longURL);
});

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/login");
  }
  const user = usersDatabase.findById(req.session.userId);
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!isLoggedIn(req)) {
    return renderError(req, res, "You are not logged in.", 403);
  }

  const shortURL = req.params.shortURL;
  if (!urlDatabase.urls[shortURL]) {
    return renderError(req, res, "No such URL.", 404);
  }

  const userId = req.session.userId;
  const user = usersDatabase.findById(userId);
  if (!urlDatabase.urlsByUser(user)[shortURL]) {
    return renderError(req, res, "You do not have editing rights to this URL", 403);
  }

  const templateVars = {
    shortURL,
    longURL: urlDatabase.urls[shortURL].longURL,
    user
  };
  res.render('urls_show', templateVars);
});

app.get("/urls", (req, res) => {
  const user = usersDatabase.findById(req.session.userId);
  const permittedURLs = urlDatabase.urlsByUser(user);

  const templateVars = {
    urls: permittedURLs,
    user
  };
  res.render('urls_index', templateVars);
});

app.get("/register", (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: usersDatabase.findById(req.session.userId)
  };
  res.render('user_register', templateVars);
});

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: usersDatabase.findById(req.session.userId)
  };
  res.render('user_login', templateVars);
});

app.get("*", (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

app.post("/urls", (req, res) => {
  if (!isLoggedIn(req)) {
    return renderError(req, res, "You must be logged in to create shortened URLs", 403);
  }
  let newKey = generateRandomString(6, usersDatabase.users);

  let longURL = req.body.longURL;
  longURL = prefixURL(longURL);

  urlDatabase.urls[newKey] = {
    longURL,
    userId: req.session.userId
  };

  res.redirect(303, `/urls/${newKey}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { userId } = req.session;
  const { shortURL } = req.params;

  if (!isLoggedIn(req)) {
    return renderError(req, res, "You are not logged in.", 403);
  }

  if (userId !== urlDatabase.urls[shortURL].userId) {
    return renderError(req, res, "You do not own this URL.", 403);
  }

  urlDatabase.removeURL(shortURL);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const { userId } = req.session;
  const { shortURL } = req.params;

  if (!isLoggedIn(req)) {
    return renderError(req, res, "You are not logged in.", 403);
  }

  if (userId !== urlDatabase.urls[shortURL].userId) {
    return renderError(req, res, "You do not own this URL.", 403);
  }

  let { newURL } = req.body;
  newURL = prefixURL(newURL);

  urlDatabase.updateURL(shortURL, newURL);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = usersDatabase.findByEmail(email);

  if (!user || !password || !usersDatabase.isValidPassword(user, password)) {
    return renderError(req, res, "Incorrect username or password", 403);
  }

  req.session.userId = user.id;
  return res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return renderError(req, res, "Empty email or password", 400);
  }

  const user = usersDatabase.findByEmail(email);

  if (user) {
    return renderError(req, res, "User already exists", 409);
  }

  const newUser = usersDatabase.addUser(email, password);
  req.session.userId = newUser.id;
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp running on port ${PORT}!`);
});