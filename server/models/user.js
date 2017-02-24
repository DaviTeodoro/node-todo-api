const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        require: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{value} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        acess: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
});

UserSchema.methods.toJSON = function() {
    var userObject = this.toObject();

    return _.pick(userObject, ['_id'], ['email']);
};

UserSchema.methods.generateAuthToken = function () {
    var acess = 'auth';
    var token = jwt.sign({_id: this._id.toHexString(), acess }, 'abc123').toString();

    this.tokens.push({acess, token});

    return this.save().then(() => {
        return token;
    });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User}