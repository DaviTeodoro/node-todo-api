var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    //vou fazer uma request com um token que está na header na header
    var token = req.header('x-auth');

    //vou procurar saber se o token é valido e corresponde a algum usuário 
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        //depois de confirmar que o usuário com determinado token que veio na header existe eu modifico o request.user pro usuário que eu encontrei. 
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
}

module.exports = {authenticate};