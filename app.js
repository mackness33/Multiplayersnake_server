const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.send("Node Server is running. Yay!!");
    console.log('in the index');
})

io.on('connection', (socket) => {
    console.log("Connected successfully ", socket.id);

    socket.on('disconnect', () => {
        console.log('Disconnected successfully ', socket.id);
    });

    socket.on('reconnect', () => {
        console.log('Reconnected successfully ', socket.id);
    });

    socket.on('create', (name, player, ack) => {
        try {
            games.create(name, player);
            socket.join(name);
            console.log(`${player} created ${name}`);
            ack(true);
        } catch(e) {
            socket.emit('fail', e.message);
            console.error(e);
            ack(false);
        }
    });

    socket.on('join', (name, player) => {
        try {
            games.join(name, player);
            socket.join(name);
            console.log(`${player} joined ${room}`);
            ack(true);
        } catch (e) {
            socket.emit('fail', e.message);
            console.error(e);
            ack(false);
        }
    });

    socket.on('leave', (name, player) => {
        try {
            games.leave(name, player);
            socket.leave(name);
            console.log(`${player} leaved ${room}`);
        } catch (e) {
            socket.emit('fail', e.message);
            console.error(e);
        }
    });
})

server.listen(3001,  ()=> {
    console.log(`listening to: ${3001}`);
});