const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.use(express.urlencoded({ extended: true} ));

app.set('view engine', 'ejs');

const urlDatabase = {};

const users = {};

const checkUniqueness = function (code) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (const url in urlDatabase) {
    if (code === url) {
      code += characters[Math.floor(Math.random() * 62)];
      code = code.split('');
      code[5] = '';
      code = code.join('');
      return checkUniqueness(code);
    }
  }
  return code;
};

const getTiny = function generateRandomString () {
  let code = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 6; i++) {
    code += characters[Math.floor(Math.random() * 62)];
  }
  code = checkUniqueness(code);
  return code;
};

const checkEmail = function (email) {
  const array = Object.values(users);
  const emails = [];
  for (const item of array) {
    emails.push(item.email);
  }
  for (const element of emails) {
    if (email === element) {
      return false;
    }
  }
  return true;
};

const urlsForUser = function (id) {
  const usersURL = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]['userID'] === id) {
      usersURL[url] = urlDatabase[url];
    }
  }
  return usersURL;
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render('registration');
});

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password && checkEmail(req.body.email)) {
  const id = getTiny();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.session.user_id = id;
  users[id] = {
    id,
    email: req.body.email,
    password: hashedPassword
  };
  res.redirect('/urls');
  } else {
    res.send('Invalid Credentials')
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render('login');
});

app.post('/login', (req, res) => {
  const array = Object.values(users)
  for (const user of array) {
    if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    }
  }
  res.statusCode = 403;
  res.send('Invalied Credentials');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot perform this action. Please Login');
  }
  let tinyURL = getTiny();
  urlDatabase[tinyURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${tinyURL}`);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot access this page. Please Login');
  }
  const validURLs = urlsForUser(req.session.user_id);
  const templateVars = { urls: validURLs, user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot access this page. Please Login')
  };
  for (const item in urlDatabase) {
    if (urlDatabase[item]['userID'] === req.session.user_id) {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], newLongURL: '', user: users[req.session.user_id] };
      res.render('urls_show', templateVars);
    }
  }
  res.send('Unable to access URL');
});

app.post('/urls/:id/edit', (req, res) => {
  const validURLs = urlsForUser(req.session.user_id);
  if (validURLs[req.params.id] === urlDatabase[req.params.id]) {
    newLongURL = req.body.newLongURL;
    urlDatabase[req.params.id]['longURL'] = newLongURL;
    res.redirect('/urls');
  } else {
    res.send('Invalid credition for this action.')
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const validURLs = urlsForUser(req.session.user_id);
  if (validURLs[req.params.id] === urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send('Invalid credition for this action.')
  }
});

app.get('/u/:id', (req, res) => {
  const URL = urlDatabase[req.params.id]['longURL']
  res.redirect(URL);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello World!<b>World</></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});