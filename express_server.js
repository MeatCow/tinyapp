const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./lib/utils');

const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "Nl6XyH"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "Nl6XyH"
  }
};

const usersDatabase = {
  _users:{
    'Nl6XyH': {
      id: 'Nl6XyH',
      email: 'matt.pauze@gmail.com',
      password: 'welcome1'
    }
  },
  get users() {
    return this._users;
  },
  addUser(email, password) {
    const newUser = {
      id: generateRandomString(6, this.users),
      email,
      password
    };
    this._users[newUser.id] = newUser;
    return newUser;
  },
  findById(id) {
    return this.users[id];
  },
  findByEmail(email) {
    return Object.values(this.users).find(user => user.email === email);
  }
};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//TODO: Replace with redirects with error codes. Maybe Ajax?
const renderError = (req, res, errMsg, errorCode) => {
  const user = usersDatabase.findById(req.cookies.userId);
  console.log("ID:", req.body.id, "User:", user);
  res.render('user_error', {error: errMsg, user}, (error, html) => {
    res.status(errorCode).send(html);
  });
};

const isLoggedIn = (request) => {
  return !!request.cookies.userId;
};

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    return renderError(req, res, "Resource does not exists", 404);
  }
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const user = usersDatabase.findById(req.cookies.userId);
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = usersDatabase.findById(req.cookies.userId);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };
  res.render('urls_show', templateVars);
});

app.get("/urls", (req, res) => {
  const user = usersDatabase.findById(req.cookies.userId);
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render('urls_index', templateVars);
});

app.get("/register", (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: usersDatabase.findById(req.cookies.userId)
  };
  res.render('user_register', templateVars);
});

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: usersDatabase.findById(req.cookies.userId)
  };
  res.render('user_login', templateVars);
});

app.get("*", (req, res) => {
  res.redirect("/urls");
});

app.post("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  let newKey = generateRandomString(6, usersDatabase.users);
  
  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[newKey] = {
    longURL,
    userId: req.cookies.userId
  };
  
  res.redirect(303, `/urls/${newKey}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL].longURL = newURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const user = usersDatabase.findByEmail(req.body.email);
  const password = req.body.password;

  if (user && user.password === password) {
    res.cookie('userId', user.id);
    return res.redirect('/urls');
  }

  return renderError(req, res, "Incorrect username or password", 403);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return renderError(req, res, "Empty email or password", 400);
  }

  if (!usersDatabase.findByEmail(email)) {
    const newUser = usersDatabase.addUser(email, password);
    res.cookie('userId', newUser.id);
    return res.redirect('/urls');
  }
  
  return renderError(req, res, "User already exists", 409);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});