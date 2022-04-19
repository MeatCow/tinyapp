const express = require('express');
const bodyParser = require('body-parser');
const { generateRandomString } = require('./lib/utils');

const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    return res.status(404).send("Resource does not exists.");
  }
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("*", (req, res) => {
  res.redirect("/urls/new");
});

app.post("/urls/new", (req, res) => {
  let newKey;
  do {
    newKey = generateRandomString(6);
  } while (urlDatabase[newKey]);
  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[newKey] = longURL;
  res.redirect(303, `/urls/${newKey}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});