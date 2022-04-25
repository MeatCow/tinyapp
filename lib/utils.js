const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
* Generate a random alphanumeric sequence of characters, using upper and lowercase letters.
* If given an object, it will ensure that the generated string is not an existing key in the object.
* @param {Number} length Desired length of the id
* @param {Object} object Object to be searched against for an existing key.
* @returns {String} A new String to be used as key.
*/
const generateRandomString = (length, object = {}) => {
  let result;

  do {
    let acc = [];
    for (let i = 0; i < length; i++) {
      acc.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
    }
    result = acc.join('');
  } while (object[result]);

  return result;
};

/**
* Send a rendered response based on the errorMsg and the errorCode.
* @param {Request} req Request object, containing the user's session information. Expects req.session.userId to containt user ID.
* @param {Response} res Response object, to which to send the rendered page.
* @param {String} errorMsg Error message that you would like displayed to the user.
* @param {Number} errorCode HTTP error code, such as 404.
* @returns {undefined}
*/
const renderError = (req, res, errorMsg, errorCode) => {
  res.render('user_error', { error: errorMsg, user: req.user }, (error, html) => {
    res.status(errorCode).send(html);
  });
};


/**
* Returns the url, prefixed with http, if required. Will not modify the url if it contains http or https, no matter where in the url.
* @param {String} url String to be parsed for "http[s]"
* @returns {String} A url prefixed with http, if it wasn't already.
*/
const prefixURL = (url) => {
  if (!/^http[s]?:\/\//.test(url)) {
    return "http://" + url;
  }
  return url;
};

module.exports = { renderError, generateRandomString, prefixURL };