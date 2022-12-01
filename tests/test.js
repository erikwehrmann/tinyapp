const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  'h23jK3': {
    id: 'h23jK3',
    email: 'jeff321@gmail.com',
    password: 'purple-monkey-dinosaur'
  },
  '8wyo4v': {
    id: '8wyo4v',
    email: 'jojosiwa@applebees.com',
    password: 'hairband'
  }
};


describe('getUserByEmail', function() {
  it('should return a use with a valid email', function() {
    const user = getUserByEmail('jojosiwa@applebees.com', testUsers);
    const expectedUserID = '8wyo4v';
    assert.equal(user, expectedUserID);
  });
  it('should return undefined for invalid email', function() {
    const user = getUserByEmail('fake@email.com', testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

