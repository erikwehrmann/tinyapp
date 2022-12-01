const checkUniqueness = function (code, database) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (const element in database) {
    if (code === element) {
      code += characters[Math.floor(Math.random() * 62)];
      code = code.split('');
      code[5] = '';
      code = code.join('');
      return checkUniqueness(code);
    }
  }
  return code;
};

const getTiny = function generateRandomString (database) {
  let code = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 6; i++) {
    code += characters[Math.floor(Math.random() * 62)];
  }
  code = checkUniqueness(code, database);
  return code;
};

const urlsForUser = function (id, database) {
  const usersURL = {};
  for (const url in database) {
    if (database[url]['userID'] === id) {
      usersURL[url] = database[url];
    }
  }
  return usersURL;
};

const getUserByEmail = function(email, database) {
  for (const item in database) {
    if (database[item].email === email) {
      const user = database[item].id;
      return user;
    }
  }
}

module.exports = { getTiny, urlsForUser, getUserByEmail };