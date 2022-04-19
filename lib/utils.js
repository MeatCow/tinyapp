const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateRandomString = (length) => {
  let result = [];

  for (let i = 0; i < length; i++) {
    result.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
  }

  return result.join('');
};

module.exports = { generateRandomString };