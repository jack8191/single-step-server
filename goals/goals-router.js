const express = require('express')
//const bodyParser = require('body-parser')

const {Goal} = require('../models')
const router = express.Router()

//const jsonParser = bodyParser.json()

router.get('/', (req, res) => {
    Goal.find()
        .then(goal => {
            res.json(goal.map(goal => goal.serialize()))
        })
        .catch(error => {
            res.status(500).json({error: 'internal server error'})
        })
})

module.exports = {router}