const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const ServerService = require('./serverService');
const manager = new ServerService();


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

    socket.on('create', (rules, ack) => {
        try {
            console.log(rules);
            manager.create(rules);
            socket.join(rules.name);
            console.log(`${rules.player} created ${rules.name}`);
            ack(true);
        } catch(e) {
            console.error(e);
            ack(false);
        }
    });

    socket.on('join', (data, ack) => {
        try {
            const rules = manager.join(data.name, data.player);
            socket.to(data.name).emit('player', ({player: data.player, isDeleted: false}));
            socket.join(data.name);
            console.log(`${data.player} joined ${data.name}`);
            ack({rules, isFull: null});
        } catch (e) {
            console.error(e);
            ack({rules: null, isFull: e.isFull});
        }
    });

    socket.on('leave', (data) => {
        try {
            manager.leave(data.name, data.player);
            socket.leave(data.name);
            console.log(`${data.player} leaved ${data.name}`);
            socket.to(data.name).emit('player', ({player: data.player, isDeleted: true}));
        } catch (e) {
            socket.emit('fail', e.message);
            console.error(e);
        }
    });

    socket.on('ready', (_) => {

    });

    socket.on('removePlayer', (_) => {

    });
})

server.listen(3001,  ()=> {
    console.log(`listening to: ${3001}`);
});