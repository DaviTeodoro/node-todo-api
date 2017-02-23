const {ObjectID} = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo'
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done());
});

describe('POST /todos/', () => {
    it('Should creat a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.find({ text: 'Test todo text' }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('Should not creat a todo with bad data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('Should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('Should get one todo by its ID', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done);

    });

    it('Should return 404 if Todo not found', (done) => {
        var id = new ObjectID()
        request(app)
        .get(`/todos/${id.toHexString()}`)
        .expect(404)
        .expect((res) => {
            expect(res.body.error).toBe('Todo not found')
        })
        .end(done);
    });

    it('Should return 404 if non-object ID', (done) => {
        request(app)
        .get(`/todos/123`)
        .expect(404)
        .expect((res) => {
            expect(res.body.error).toBe('ID is not valid')
        })
        .end(done);
    });
})

describe('DELETE /todos/:id', () =>{
    it('Should delete a todo', (done) =>{
        var _id = todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${_id}`)
        .expect(200)
        .expect((res) => { 
            expect(res.body.todo._id).toBe(_id)
        })
        .end((err, res) => {
            if (err) return done(err);

            Todo.findById(_id).then((todo) =>{
                expect(todo).toNotExist();
                done();
            }).catch((e) => done(e));
        });
    });

    it('Should return 404 if todo not found', (done) => {
        var _id = new ObjectID();

        request(app)
        .delete(`/todos/${_id}`)
        .expect(404)
        .expect((res) => {
            expect(res.body.error).toBe('Todo not found, couldnt be deleted')
        })
        .end(done);
    });

    it('Should return 404 if ObjectID is invalid', (done) => {
        request(app)
        .delete(`/todos/123`)
        .expect(404)
        .expect((res) => {
            expect(res.body.error).toBe('ID is not valid')
        })
        .end(done);
    });
})