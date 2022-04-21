const { assert } = require('chai');

const { UserDatabase } = require('../lib/UserDatabase');
const userDatabase = new UserDatabase();

userDatabase._users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findByEmail', () => {
  it('should return a user with valid email', () => {
    const user = userDatabase.findByEmail("user@example.com");
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined with an invalid email', () => {
    const user = userDatabase.findByEmail("admin@cownet.com");
    assert.isUndefined(user);
  });
});