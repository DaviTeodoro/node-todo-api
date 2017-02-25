require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();

const port = process.env.PORT

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    })

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos });
    }, (e) => {
        res.status(400).send(e);
    })
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ error: 'ID is not valid' });
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send({ error: 'Todo not found' })
        }
        res.send({ todo });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ error: 'ID is not valid' });
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send({ error: 'Todo not found, couldnt be deleted' })
        }
        res.send({ todo });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text'], ['completed']);

    if (!ObjectID.isValid(id)) return res.status(404).send({ error: 'ID is not valid' });

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
        if (!todo) return res.status(404).send({ error: 'Todo not found, could not be updated' })
        res.send({ todo });
    }).catch((e) => res.status(404).send());

});

// POST /users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email'], ['password']);

    var user = new User(body);

    user.save().then(() => {
        //retorna um token que vai ser usado no proximo .then() 
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });

});

// POST /users/login {email , password}
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email'], ['password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);            
        });
    }).catch((e) => res.status(400).send(e));

});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) =>{
    req.user.removeToken(req.token).then(() =>{
        res.status(200).send();
    }, () => {
        res.status(400).send();
    })
});

app.listen(port, () => console.log(`Server up on port ${port}`))

module.exports = { app };