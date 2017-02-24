const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')

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
UserSchema.methods.toJSON = function () {
    var userObject = this.toObject();

    return _.pick(userObject, ['_id'], ['email']);
};

//Retona o token que vai ser usado na header do usuário quando esse for salvado
UserSchema.methods.generateAuthToken = function () {
    var acess = 'auth';
    var token = jwt.sign({ _id: this._id.toHexString(), acess }, 'abc123').toString();

    this.tokens.push({ acess, token });

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

UserSchema.statics.findByCredentials = function (email, password) {

    return this.findOne({ email }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user)
                } else {
                    reject();
                }
            });
        });

    });
};

//Hash a senha antes de salvar 
UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User }