const path = require('path');
const express = require('express');
const layout = require('express-layout');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.options('*', cors())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const middlewares = [
  layout(),
   express.static(path.join(__dirname, 'public')),
  bodyParser.urlencoded({ extended: true }),
];
app.use(middlewares);

  // use when response required in json format
//  app.use(bodyParser.urlencoded({ extended: true }));
//  app.use(bodyParser.json());

app.use('/', routes);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(4000, () => {
  console.log('App running at http://localhost:4000');
});
