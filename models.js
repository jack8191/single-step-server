const mongoose = require('mongoose')
const Schema = mongoose.Schema

const goalSchema = mongoose.Schema({
    title: String,
    description: String,
    targetDate: Date,
    progress: {type: Number, default: 0},
    target: {type: Number, min: 1},
    reward: String,
    complete: {type: Boolean, default: false},
    timestamps: true
})

goalSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        targetDate: this.targetDate,
        progress: this.progress,
        target: this.target,
        reward: this.reward,
        complete: this.complete,
        createdAt: this.createdAt
    }
}

const Goal = mongoose.model('Goal', goalSchema)

module.exports = {Goal}

