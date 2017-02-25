const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken')

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
    _id: userOneID,
    email: 'lol@gmail.com',
    password: 'userOnePass',
    tokens: [{
        acess: 'auth',
        token: jwt.sign({ _id: userOneID, acees: 'auth' }, process.env.JWT_SECRET).toString()
    }]
},
{
    _id: userTwoID,
    email: 'trollo@gmail.com',
    password: 'userTwoPass',
    tokens: [{
        acess: 'auth',
        token: jwt.sign({ _id: userTwoID, acees: 'auth' }, process.env.JWT_SECRET).toString()
    }]
}]

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneID
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 1234,
    _creator: userTwoID
}]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done());
}


const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};
module.exports = { todos, populateTodos, users, populateUsers };