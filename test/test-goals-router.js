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
        targetDate : 05/07/2020,
        progress : 1,
        target : 2,
        reward : "A clener sleeping expereince",
        ownedBy : "blumpo"
    }
    const moreSeedData = {
        _id : "59074c7c057aaffaafb0da65",
        title : "Change Sheets Again!",
        description : "Keep Those Sheets Clean!",
        targetDate : 06/07/2020,
        progress : 1,
        target : 2,
        reward : "A clener sleeping expereince",
        ownedBy : "blumpo"
    }
    const yetMoreSeedData = {
        _id : "59074c7c057aaffaafb0da66",
        title : "Change Sheets!",
        description : "Keep Those Sheets Clean!",
        targetDate : 07/08/2020,
        progress : 1,
        target : 2,
        reward : "A clener sleeping expereince",
        ownedBy : "mumbo"
    }
    return Goal
        .insertMany([seedData, moreSeedData, yetMoreSeedData])
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

    describe('delete a goal based on its id', function() {
        it('should delete a goal based on its id', function() {
            return chai.request(app)
                .delete('/goals/59074c7c057aaffaafb0da64')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(204)
                })
        })
    })
})

describe('/get/:currentUser', function() {
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

    describe('get all goals of the current user', function() {
        it('should only return the goals owned by the specified user', function() {
            return chai.request(app)
                .get('/goals/blumpo')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res.body).to.have.lengthOf(2)
                })
        })
        it('should return the correct fields', function() {
            return chai.request(app)
                .get('/goals/blumpo')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res.body[0]).to.contain.all.keys(['id', 'title', 'description', 'targetDate', 
                        'progress', 'target', 'reward'
                    ])
                })
        })
    })
})

describe('/post', function() {
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

    describe('post a new goal', function() {
        it('should post a new bucket when supplied with a proper req body', function() {
            const newGoal = {
                "title" : "Change Sheets Again!",
                "description" : "Keep Those Sheets Clean!",
                "targetDate" : 06/07/2020,
                "progress" : 1,
                "target" : 2,
                "reward" : "A clener sleeping expereince",
                "ownedBy" : "blumpo"
            }
            return chai.request(app)
                .post('/goals')
                .set('authorization', `Bearer ${token}`)
                .send(newGoal)
                .then(res => {
                    expect(res.status).to.equal(201)
                })
        })
        it('should reject a goal missing a field', function() {
            const wrongNewGoal = {
                "description" : "Keep Those Sheets Clean!",
                "targetDate" : 06/07/2020,
                "progress" : 1,
                "target" : 2,
                "reward" : "A clener sleeping expereince",
                "ownedBy" : "blumpo"
            }
            return chai.request(app)
                .post('/goals')
                .set('authorization', `Bearer ${token}`)
                .send(wrongNewGoal)
                .then(res => {
                    expect(res.status).to.equal(400)
                    expect(res.error.text).to.equal('Missing `title` in request body')
                })
        })
    })
})

describe('goals PATCH', function() {
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
    it('should update a goal based on the id and req body', function() {
        let updatedGoal = {"title": "Updated Title", "reward": "A new reward"}
        return chai.request(app)
        .patch('/goals/59074c7c057aaffaafb0da64')
        .set('authorization', `Bearer ${token}`)
        .send(updatedGoal)
        .then(res => {
            expect(res.body.title).to.equal("Updated Title")
            expect(res.body.reward).to.equal("A new reward")
        })
    })
})