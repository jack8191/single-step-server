const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const { app, runServer, closeServer } = require('../server')
const { Goal } = require('../models')
const { JWT_SECRET, TEST_DATABASE_URL} = require('../config')

const expect = chai.expect
chai.use(chaiHttp)

function tearDownDb() {
    return new Promise((resolve, reject) => {
      console.warn('Deleting database')
      mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
}

function seedGoalData() {
    console.info('seeding goal data')
    const seedData = {
        _id : "59074c7c057aaffaafb0da64",
        title : "Change Sheets!",
        description : "Keep Those Sheets Clean!",
        days : 7,
        progress : 1,
        target : 2,
        reward : "A clener sleeping expereince",
        ownedBy : "blumpo"
    }
    return Goal.create(seedData) 
}

const token = jwt.sign(
    {
      user: {
        username: 'blumpo'
      }
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: 'blumpo',
      expiresIn: '7d'
    }
)

describe('/delete/:goalId', function() {
    
    before(function() {
        return runServer()
    })

    beforeEach(function() {
        return seedGoalData()  
    })

    afterEach(function() {
        return tearDownDb()
    })

    after(function() {
        return closeServer()
    })

    describe('delete a bucket based on its id', function() {
        it('should delete a bucket based on its id', function() {
            return chai.request(app)
                .delete('/goals/59074c7c057aaffaafb0da64')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(204)
                })
        })
    })
})