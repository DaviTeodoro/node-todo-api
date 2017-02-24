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

//Importante pra nao enviar muitas informações, só as selecionadas
UserSchema.methods.toJSON = function() {
    var userObject = this.toObject();

    return _.pick(userObject, ['_id'], ['email']);
};

//Retona o token que vai ser usado na header do usuário quando esse for salvado
UserSchema.methods.generateAuthToken = function () {
    var acess = 'auth';
    var token = jwt.sign({_id: this._id.toHexString(), acess }, 'abc123').toString();

    this.tokens.push({acess, token});

    return this.save().then(() => {
        return token;
    });
};

//Este metodo é usado no UserSchema e recebe um token, confirma se é valido e retorna o objeto usuário correspondente a esse token. Se der merda ele retorna uma 'promessa rejeitada' 
UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123')
    } catch (e) {
        return Promise.reject();
    }

     return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.acess': 'auth'
     }); 

};

var User = mongoose.model('User', UserSchema);

module.exports = {User}