const bcrypt = require('bcryptjs')
const {Schema, model} = require('mongoose') 

const userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.methods.serialize = function() {
    return {
        username: this.username,
        userId: this._id
    }
}

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password)
}

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10)
}

const goalSchema = Schema({
    title: String,
    description: String,
    targetDate: Date,
    progress: {type: Number, default: 0},
    target: {type: Number, min: 1},
    reward: String, 
    timestamps: Date,
    ownedBy: String 
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
        createdAt: this.createdAt,
        ownedBy: this.ownedBy
    }
}

const Goal = model('Goal', goalSchema)
const User = model('User', userSchema)

module.exports = {Goal, User}

