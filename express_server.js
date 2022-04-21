require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { generateRandomString } = require('./lib/utils');
const cookieSession = require('cookie-session');

const { SALT, SESSION_SECRET } = process.env;
const PORT = 8080;

const app = express();

const urlDatabase = {
  _urls: {
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userId: "Nl6XyH"
    },
    "9sm5xK": {
      longURL: "http://www.google.com",
      userId: "Nl6XyH"
    },
    "jkl234": {
      longURL: "http://www.youtube.com",
      userId: "asdf12"
    }
  },
  get urls() {
    return this._urls;
  },
  changeURL(shortURL, newURL) {
    this._urls[shortURL].longURL = newURL;
  },
  removeURL(shortURL) {
    delete this._urls[shortURL];
  },
  urlsByUser(user) {
    const results = {};
    if (!user) {
      return results;
    }
    for (const [key, object] of Object.entries(this.urls)) {
      if (object.userId === user.id) {
        results[key] = object;
      }
    }
    return results;
  }
};

const usersDatabase = {
  _users: {
    'Nl6XyH': {
      id: 'Nl6XyH',
      email: 'matt.pauze@gmail.com',
      password: bcrypt.hashSync(process.env.TEST1_PASSWORD, SALT)
    },
    'asdf12': {
      id: 'asdf12',
      email: 'matthieu.pauze@gmail.com',
      password: bcrypt.hashSync(process.env.TEST2_PASSWORD, SALT)
    }
  },
  get users() {
    return this._users;
  },
  addUser(email, password) {
    const newUser = {
      id: generateRandomString(6, this.users),
      email,
      password: bcrypt.hashSync(password, SALT)
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
app.use(cookieSession({
  name: "userId",
  secret: SESSION_SECRET
}));

//TODO: Replace with redirects with JSON error codes.
const renderError = (req, res, errMsg, errorCode) => {
  const user = usersDatabase.findById(req.session.userId);
  res.render('user_error', { error: errMsg, user }, (error, html) => {
    res.status(errorCode).send(html);
  });
};

const prefixURL = (url) => {
  if (!url.includes("http://")) {
    return "http://" + url;
  }
  return url;
};

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
    return res.redirect("/urls");
  }
  const user = usersDatabase.findById(req.session.userId);
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase.urls[shortURL]) {
    return res.redirect("/urls");
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
  res.redirect("/urls");
});

app.post("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/urls");
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

  if (!isLoggedIn(req) || userId !== urlDatabase.urls[shortURL].userId) {
    return res.status(403).json({ Error: "You do not have permission to access this resource" });
  }

  urlDatabase.removeURL(shortURL);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (!isLoggedIn(req) || req.session.userId !== urlDatabase.urls[shortURL].userId) {
    return res.redirect("/urls");
  }

  let { newURL } = req.body;
  newURL = prefixURL(newURL);

  urlDatabase.changeURL(shortURL, newURL);
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = usersDatabase.findByEmail(email);

  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  if (!user || !password) {
    return renderError(req, res, "Incorrect username or password", 403);
  }
  if (!bcrypt.compareSync(password, user.password)) {
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
  const user = usersDatabase.findByEmail(email);

  if (isLoggedIn(req)) {
    return res.redirect("/urls");
  }
  if (!email || !password) {
    return renderError(req, res, "Empty email or password", 400);
  }
  if (user) {
    return renderError(req, res, "User already exists", 409);
  }

  const newUser = usersDatabase.addUser(email, password);
  req.session.userId = newUser.id;
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});