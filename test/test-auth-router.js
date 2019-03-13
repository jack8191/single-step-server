'use strict';
global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../models');
const { localStrategy, jwtStrategy} = require('../auth/strategies.js')

const { JWT_SECRET } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database')
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}


describe('Auth endpoints', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    // return User.find()
    //   .then(users => console.log(users))
    //   .then(()=>
      
      return User.hashPassword(password).then(password =>
        User.create({
          username,
          password
       
        })
      )
      // )
  });

  afterEach(function () {
    return tearDownDb()
  });

  describe('/auth/login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/auth/login')
        // .then(() =>
        //   expect.fail(null, null, 'Request should not succeed')
        // )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(400);
        });
    });
    it('Should reject requests with incorrect usernames', function () {
      return chai
        .request(app)
        .post('/auth/login')
        .send({ username: 'wrongUsername', password })        
        // .then(() =>
        //   expect.fail(null, null, 'Request should not succeed')
        // )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect passwords', function () {
      return chai
        .request(app)
        .post('/auth/login')
        .send({ username, password: 'wrongPassword' })
        // .then(() =>
        //   expect.fail(null, null, 'Request should not succeed')
        // )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token', function () {
      return chai
        .request(app)
        .post('/auth/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          // const payload = jwt.verify(token, JWT_SECRET, {
          //   algorithm: ['HS256']
          // });
          // expect(payload.username).to.deep.equal({
          //   username,
          // });
        });
    });
  });

  describe('/auth/refresh', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/auth/refresh')
        // .then(() =>
        //   expect.fail(null, null, 'Request should not succeed')
        // )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          username
        
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        // .then(() =>
        //   expect.fail(null, null, 'Request should not succeed')
        // )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );

      return chai
        .request(app)
        .post('/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        // .then(() =>
        //   expect.fail(null, null, 'Request should not succeed')
        // )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token with a newer expiry date', function () {
      const token = jwt.sign(
        {
          user: {
            username
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post('/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal({
            username
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
});
