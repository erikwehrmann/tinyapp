const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

const checkUniqueness = function (code){
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

app.use(express.urlencoded({ extended: true}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  let tinyURL = getTiny();
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect(`/urls/${tinyURL}`);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});