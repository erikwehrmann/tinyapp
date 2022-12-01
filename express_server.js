const express = require('express');
const app = express();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['uBjq2k4', 'k23is3N']
}));
const bcrypt = require('bcryptjs');
const { getTiny, urlsForUser, getUserByEmail } = require('./helpers')
const PORT = 8080;

app.use(express.urlencoded({ extended: true} ));

app.set('view engine', 'ejs');

const urlDatabase = {};

const users = {};

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
  if (req.body.email && req.body.password && !getUserByEmail(req.body.email, users)) {
  const id = getTiny(users);
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
  const user = getUserByEmail(req.body.email, users)
  if (user && bcrypt.compareSync(req.body.password, users[user].password)) {
    req.session.user_id = users[user].id;
    res.redirect('/urls');
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
  let tinyURL = getTiny(urlDatabase);
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
  const validURLs = urlsForUser(req.session.user_id, urlDatabase);
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

app.put('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id].userID === users[req.session.user_id].id) {
    newLongURL = req.body.newLongURL;
    urlDatabase[req.params.id]['longURL'] = newLongURL;
    res.redirect('/urls');
  } else {
    res.send('Invalid credition for this action.')
  }
});

app.delete('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id].userID === users[req.session.user_id].id) {
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