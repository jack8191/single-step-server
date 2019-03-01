const express = require('express')
//const bodyParser = require('body-parser')

const {Goal} = require('../models')
const router = express.Router()

//const jsonParser = bodyParser.json()

router.get('/:currentUser', (req, res) => {
    Goal.find({ownedBy: req.params.currentUser})
        .then(goal => {
            res.json(goal.map(goal => goal.serialize()))
        })
        .catch(error => {
            res.status(500).json({error: 'internal server error'})
        })
})

router.delete('/:goalId', (req, res) => {
    Goal.findByIdAndDelete(req.params.goalId)
        .then(() => {
            res.status(204).json({ message: 'goal deleted' })
        })
        .catch(err => {
            res.status(500).json({ error: 'internal server error'})
        })
})

module.exports = {router}