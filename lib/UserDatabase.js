const { generateRandomString } = require('./utils');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { TEST1_ACC_NAME, TEST1_PASSWORD, TEST2_ACC_NAME, TEST2_PASSWORD, SALT } = process.env;

class UserDatabase {
  constructor() {
    this._users = {
      'Nl6XyH': {
        id: 'Nl6XyH',
        email: TEST1_ACC_NAME,
        password: bcrypt.hashSync(TEST1_PASSWORD, SALT)
      },
      'kt2UIR': {
        id: 'kt2UIR',
        email: TEST2_ACC_NAME,
        password: bcrypt.hashSync(TEST2_PASSWORD, SALT)
      }
    };
  }

  get users() {
    return this._users;
  }

  addUser(email, password) {
    const newUser = {
      id: generateRandomString(6, this.users),
      email,
      password: bcrypt.hashSync(password, SALT)
    };
    this._users[newUser.id] = newUser;
    return newUser;
  }

  findById(id) {
    return this.users[id];
  }

  findByEmail(email) {
    return Object.values(this.users).find(user => user.email === email);
  }

  isValidPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }
}

module.exports = { UserDatabase };