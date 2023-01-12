const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const semaphore = require('semaphore')(1);
require('dotenv').config();

const ServerService = require('./serverService');
const manager = new ServerService();

// app.get('/', async (req, res) => {
//     res.send("Node Server is running. Yay!!");
//     console.log('in the index');
// })

const end_and_save_game = async (room) => {
    if (manager.exists(room)) {
        io.to(room).emit('end');
        const game = await manager.save_game(room);
        io.to(room).emit('results', (game));
        manager.remove(room);
        console.log('Game has ended');
    }
}

// wrap it up like this
const lock = async () =>
    new Promise((resolve) => {
        semaphore.take(() => {
            resolve(() => {
                semaphore.leave();
            });
        });
    });

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

    socket.on('join', async (data, ack) => {
        try {
            const infos = manager.join(data.room, data.player);
            io.to(data.room).emit('player', ({player: data.player, isDeleted: false}));
            await socket.join(data.room);
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
            if (players) {
                io.to(data.room).emit('ready', (players));
                console.log(manager._games);
                console.log('ready!');
                const is_time_attack = await game_end;
                if (is_time_attack && manager.exists(data.room)) {
                    const unlock = await lock();
                    await end_and_save_game(data.room);
                    unlock();
                }
            } else {
                socket.emit('ready', ([]));
            }
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('removePlayer', (data) => {
        try {
            manager.leave(data.room, data.player);
            const room = manager._games[`${data.room}`];
            socket.leave(data.room);
            io.to(data.room).emit('player', ({player: data.player, isDeleted: true}));
            console.log(`${room.admin} removed ${data.player} from ${data.room}`);
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('eat', async (data) => {
        try {
            const exceed_max_points = manager.eat(data.room, data.player, data.isSpecial);
            io.to(data.room).emit('points', ({player: data.player, isSpecial: data.isSpecial}));
            console.log(`${data.player} in the room ${data.room} has eaten a ${(data.isSpecial) ? 'special' : 'normal'} fruit`);
            if (exceed_max_points && manager.exists(data.room)) {
                const unlock = await lock();
                await end_and_save_game(data.room);
                unlock();
            }
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('end', async (data) => {
        try {
            const has_ended = manager.end(data.room, data.player);
            console.log(`${data.player} in the room ${data.room} has ended the game`);
            if (has_ended) {
                const unlock = await lock();
                await end_and_save_game(data.room);
                unlock();
            }
        } catch (e) {
            console.error(e);
        }
    });


})

server.listen(3001,  ()=> {
    console.log(`listening to: ${3001}`);
});