const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const app = express()
const morgan = require('morgan')

app.use(morgan('common'))
const jsonParser = bodyParser.json()
app.use(express.json())

const { router: goalsRouter } = require('./goals/goals-router')

app.use('/goals/', goalsRouter)

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}
  
  module.exports = { app, runServer, closeServer };
