const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('connected to MongoDB server');

//     db.collection('Todos').findOneAndUpdate({
//         _id: new ObjectID("58ad06a71a2db9f29ac762c2")
//     }, {
//         $set: {
//             completed: true,
//             text: "Comer muito cara!"
//         }
//     }, {
//         returnOriginal: false
//     }).then((result) => console.log(result));

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('58acfa35c6803c2f40314bfa')
    }, {
        $set: {
            name: 'Davi Teodoro'
        },
        $inc: {
            age: +1
        }
    }, {
        returnOriginal: false
    }).then((result) => console.log(result));

    // db.close();
});