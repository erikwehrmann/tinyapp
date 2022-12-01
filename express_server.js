const express = require('express');
const app = express();
const cookies = require('cookie-parser');
app.use(cookies());
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "jwerh2"
  },
  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: "erikw1"
  }
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

app.use(express.urlencoded({ extended: true} ));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.cookies.id) {
    res.redirect('/urls');
  }
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
  if (req.cookies.id) {
    res.redirect('/urls');
  }
  res.render('login');
});

app.post('/login', (req, res) => {
  const array = Object.values(users)
  for (const user of array) {
    if (user.email === req.body.email && user.password === req.body.password) {
      res.cookie('id', user.id);
      res.cookie('email', user.email);
      res.cookie('password', user.password);
      res.redirect('/urls');
    }
  }
  res.statusCode = 403;
  res.send('Invalied Credentials');
});

app.post('/logout', (req, res) => {
  res.clearCookie('id');
  res.clearCookie('email');
  res.clearCookie('password');
  res.redirect('/login');
});

app.post('/urls', (req, res) => {
  if (!req.cookies.id) {
    res.send('Cannot perform this action. Please Login');
  }
  let tinyURL = getTiny();
  urlDatabase[tinyURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.id
  }
  res.redirect(`/urls/${tinyURL}`);
});

app.get('/urls', (req, res) => {
  if (!req.cookies.id) {
    res.send('Cannot access this page. Please Login');
  }
  const validURLs = urlsForUser(req.cookies.id);
  const templateVars = { urls: validURLs, user: users[req.cookies.id] };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies.id) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.cookies.id] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  for (const id in urlDatabase) {
    if (id === req.params.id) {
      if (!req.cookies.id) {
        res.send('Cannot access this page. Please Login')
      }
      const validURLs = urlsForUser(req.cookies.id);
      for (const id in urlsForUser) {
        if (id === req.params.id) {
          const templateVars = { id: req.params.id, longURL: validURLs[req.params.id]['longURL'], newLongURL: '', user: users[req.cookies.id] };
          res.render('urls_show', templateVars);
        } 
      }

      if (req.cookies.id) {
        res.send("Invalid credentials to access this page.")
      }
    }
  res.send('URL does not exist.')   
  }
});

app.post('/urls/:id/edit', (req, res) => {
  const validURLs = urlsForUser(req.cookies.id);
  if (validURLs[req.params.id] === urlDatabase[req.params.id]) {
    newLongURL = req.body.newLongURL;
    urlDatabase[req.params.id]['longURL'] = newLongURL;
    res.redirect('/urls');
  } else {
    res.send('Invalid credition for this action.')
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const validURLs = urlsForUser(req.cookies.id);
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