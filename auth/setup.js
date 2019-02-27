const {router} = require('./auth-router');
const {localStrategy, jwtStrategy} = require('./strategies');

module.exports = {router, localStrategy, jwtStrategy};