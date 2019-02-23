require('dotenv').config();

const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { router: goalsRouter } = require('./goals/goals-router')
const { router: authRouter } = require('./auth/setup')
const { router: usersRouter } = require('./users/setup')
const { localStrategy, jwtStrategy } = require('./auth/setup')
const { DATABASE_URL, PORT, CLIENT_ORIGIN } = require('./config');


const app = express()

app.use(morgan('common'))
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
)

passport.use(localStrategy)
passport.use(jwtStrategy)

app.use(express.json())

  
  app.use('/goals', goalsRouter)
  app.use('/users', usersRouter)
  app.use('/auth', authRouter)
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
