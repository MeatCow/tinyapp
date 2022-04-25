const { generateRandomString } = require('./utils');

class URLDatabase {
  constructor() {
    this._urls = {
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
    };
  }
  get urls() {
    return this._urls;
  }
  addURL(longURL, userId) {
    const shortURL = generateRandomString(6, this._urls);
    this._urls[shortURL] = {
      longURL,
      userId
    };
    return shortURL;
  }
  updateURL(shortURL, newURL) {
    this._urls[shortURL].longURL = newURL;
  }
  removeURL(shortURL) {
    delete this._urls[shortURL];
  }
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
}

module.exports = { URLDatabase };