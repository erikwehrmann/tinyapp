const express = require('express');
const app = express();
const cookies = require('cookie-parser');
app.use(cookies());
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

const users = {
  erikw1: {
    id: "erikw1",
    email: "erik.wehrmann@gmail.com",
    password: "bluepaintcan1"
  },
  jwerh2: {
    id: "jwerh2",
    email: "jeff@jeffmail.com",
    password: "jeffspassword"
  }
};

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
}

app.use(express.urlencoded({ extended: true}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/register', (req, res) => {
  res.render('registration');
});

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password && checkEmail(req.body.email)) {
  const id = getTiny();
  res.cookie('id', id);
  res.cookie('email', req.body.email);
  res.cookie('password', req.body.password);
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  };
  res.redirect('/urls');
  } else {
    res.send('Invalid Credentials')
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let tinyURL = getTiny();
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect(`/urls/${tinyURL}`);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.id] };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies.id] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], newLongURL: '', user: users[req.cookies.id] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/edit', (req, res) => {
  newLongURL = req.body.newLongURL;
  urlDatabase[req.params.id] = newLongURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello World!<b>World</></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});