// Setting up imports, all dependecies and helper functions
const express = require('express');
const methodOverride = require('method-override');
const cookies = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getTiny, urlsForUser, getUserByEmail } = require('./helpers');

// Setting up middleware
const app = express();
app.use(express.urlencoded({ extended: true}));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(cookies());
app.use(cookieSession({
  name: 'session',
  keys: ['uBjq2k4', 'k23is3N']
}));

// Setting constants and database objects for server
const PORT = 8080;
const urlDatabase = {};
const users = {};

// Endpoints:
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('registration');
  }
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
    res.send('Invalid Credentials');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, users[user].password)) {
    req.session.user_id = users[user].id;
    res.redirect('/urls');
  }
  res.send('Invalied Credentials');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// 'Home' page
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot access this page. Please Login');
  } else {
    const validURLs = urlsForUser(req.session.user_id, urlDatabase);
    const templateVars = { urls: validURLs, user: users[req.session.user_id] };
    res.render('urls_index', templateVars);
  }
});

// Creating a new URL
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot perform this action. Please Login');
  } else {
    let tinyURL = getTiny(urlDatabase);
    urlDatabase[tinyURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
      dateCreated: new Date().toUTCString(),
      views: 0,
      uniqueViews: 0
    };
    res.redirect(`/urls/${tinyURL}`);
  }
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot access this page. Please Login');
  }
  for (const item in urlDatabase) {
    if (urlDatabase[item]['userID'] === req.session.user_id) {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], newLongURL: '', user: users[req.session.user_id] };
      return res.render('urls_show', templateVars);
    }
  }
  return res.send('Unable to access URL');
});


// Edit the longURL
app.put('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot perform this action. Please Login')
  } else if (urlDatabase[req.params.id].userID === users[req.session.user_id].id) {
    const newLongURL = req.body.newLongURL;
    urlDatabase[req.params.id]['longURL'] = newLongURL;
    res.redirect('/urls');
  } else if (urlDatabase[req.params.id].userID !== users[req.session.user_id].id) {
    res.send('Invalid creditials for this action.');
  } else {
    res.send('Invalid URL')
  }
});

app.delete('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send('Cannot perform this action. Please Login')
  } else if (urlDatabase[req.params.id].userID === users[req.session.user_id].id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else if (urlDatabase[req.params.id].userID !== users[req.session.user_id].id) {
    res.send('Invalid creditials for this action.');
  } else {
    res.send('Invalid URL')
  }
});

// Redirect to actual website
app.get('/u/:id', (req, res) => {
  // Updating views and unique views(using cookie-parser for unique)
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id]['views']++; 
    if (!req.cookies.viewer) {
      res.cookie('viewer', getTiny());
      urlDatabase[req.params.id]['uniqueViews']++;
    }
    const URL = urlDatabase[req.params.id]['longURL'];
    res.redirect(URL);
  } else {
    res.send('Invalid URL');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});