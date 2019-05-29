const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
// Lets us run socket IO on port 4000

// Connect to mongodb. Makes the database for us.
// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', {
    useNewUrlParser: true
}, function (err, db) {
    console.log('MongoDB connected...');

    //Connectiong to socket.io
    client.on('connection', function (socket) {
        let chat = db.collection('chats');

        //Sends the status from the server
        sendStatus = function (s) {
            //Name, status
            socket.emit('status', s);
        }
        //Get chat from mongo collection
        chat.find().limit(100).sort({
            _id: 1
        }).toArray(function (err, res) {
            if (err) {
                throw err;
            }
            //Emit the messages
            socket.emit('output', res);
        });

        //Handle input events

        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;

            //Check for name and message
            if (name === '' || message === '') {
                sendStatus('Please enter a name and message!')
            }
            //Insert message into the db
            chat.insert({
                name: name,
                message: message
            }, function () {
                client.emit('output', [data]);
                //Send status object
                sendStatus({
                    message: 'Message sent',
                    clear: true
                });
            });
        });
        //Handle clearing
        socket.on('clear', function (data) {
            //Remove all chats from the collection
            chat.remove({}, function () {
                //emit an event letting the client know all has been cleared
                socket.emit('cleared');
            })
        })

    })


    // const server = require('http').createServer(); //Make the server
    // const io = require('socket.io')(server);
    // io.on('connection', client => {
    //     client.on('event', data => {
    //         {
    //             /* ... */
    //         }
    //     });
    //     client.on('disconnect', () => {
    //         /* ... */
    //     });
    // });
    // server.listen(3000);


});