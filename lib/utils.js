const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateRandomString = (length, object = {}) => {
  let result;

  do {
    let acc = [];
    for (let i = 0; i < length; i++) {
      acc.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
    }
    result = acc.join('');
  } while (Object.keys(object).includes(result));

  return result;
};

module.exports = { generateRandomString };