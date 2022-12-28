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

    socket.on('disconnecting', () => {
        console.log('Disconnecting. Actual rooms: ', socket.rooms);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected successfully ', socket.id);
        console.log('Actual rooms: ', socket.rooms);
    });

    socket.on('reconnect', () => {
        console.log('Reconnected successfully ', socket.id);
    });

    socket.on('create', (rules, ack) => {
        try {
            console.log(rules);
            manager.create(rules);
            socket.join(rules.room);
            console.log(`${rules.player} created ${rules.room}`);
            ack(true);
        } catch(e) {
            console.error(e);
            ack(false);
        }
    });

    socket.on('join', (data, ack) => {
        try {
            const infos = manager.join(data.room, data.player);
            socket.to(data.room).emit('player', ({player: data.player, isDeleted: false}));
            socket.join(data.room);
            ack({infos, isFull: null});
        } catch (e) {
            console.error(e);
            ack({rules: null, isFull: e.isFull});
        }
    });

    socket.on('leave', (data) => {
        try {
            manager.leave(data.room, data.player);
            socket.leave(data.room);
            io.to(data.room).emit('player', ({player: data.player, isDeleted: true}));
            console.log(`${data.player} leaved ${data.room}`);
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('abort', (data) => {
        try {
            manager.abort(data.room, data.player);
            socket.leave(data.room);
            console.log(`${data.player} leaved ${data.room}`);
            io.to(data.room).emit('abort', ({}));
            console.log(`${data.player} aborted ${data.room}`);
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('ready', async (data) => {
        try {
            const {game_end, players} = manager.ready(data.room, data.player);
            io.to(data.room).emit('ready', (players));
            console.log(manager.games);
            console.log('ready!');
            // await game_end;
            socket.to(data.room).emit('end');
            console.log('Game ended');
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('removePlayer', (data) => {
        try {
            manager.leave(data.room, data.player);
            const room = manager.games[`${data.room}`];
            socket.leave(data.room);
            socket.to(data.room).emit('player', ({player: data.player, isDeleted: true}));
            console.log(`${room.admin} removed ${data.player} from ${data.room}`);
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('end', (email, ack) => {
        
    });
})

server.listen(3001,  ()=> {
    console.log(`listening to: ${3001}`);
});