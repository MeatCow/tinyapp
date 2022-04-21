const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random alphanumeric sequence of characters, using upper and lowercase letters.
 * If given an object, it will ensure that the generated string is not an existing key in the object.
 * @param {Number} length
 * @param {Object} object
 * @returns {String}
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

module.exports = { generateRandomString };