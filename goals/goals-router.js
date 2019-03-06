const express = require('express')
//const bodyParser = require('body-parser')
const passport = require('passport')

const {Goal} = require('../models')
const { localStrategy, jwtStrategy } = require('../auth/strategies')
const router = express.Router()

passport.use(localStrategy)
passport.use(jwtStrategy)
const jwtAuth = passport.authenticate('jwt', {session: false});


//const jsonParser = bodyParser.json()

router.get('/:currentUser', jwtAuth, (req, res) => {
    Goal.find({ownedBy: req.params.currentUser})
        .then(goal => {
            res.json(goal.map(goal => goal.serialize()))
        })
        .catch(error => {
            res.status(500).json({error: 'internal server error'})
        })
})

router.post('/', (req,res) => {
    const requiredFields = ['title', 'description', 'targetDate', 'target', 'reward', 'ownedBy']
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
          const message = `Missing \`${field}\` in request body`;
          console.error(message);
          console.log(req.body)
          return res.status(400).send(message);
        }
    }
    Goal.create({
        title: req.body.title,
        description: req.body.description,
        targetDate: req.body.targetDate,
        target: req.body.target,
        reward: req.body.reward,
        ownedBy: req.body.ownedBy
    })
        .then(goal => res.status(201).json(goal.serialize()))
        .catch(err => {
            console.error(err)
            res.status(500).json({ error: 'internal server error'})
        })
})

router.delete('/:goalId', jwtAuth, (req, res) => {
    Goal.findByIdAndDelete(req.params.goalId)
        .then(() => {
            res.status(204).json({ message: 'goal deleted' })
        })
        .catch(err => {
            res.status(500).json({ error: 'internal server error'})
        })
})

module.exports = {router}