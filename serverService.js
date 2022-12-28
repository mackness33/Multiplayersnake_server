const GameService = require('./gameService');

class ServerService {
    constructor () {
        this.games = {};
    }

    create = (rules) => {
        if (this.games[`${rules.room}`]) {
            throw new Error('Room already in use');
        }

        this.games[`${rules.room}`] = new GameService(rules);
    }

    remove = (room) => {
        delete this.games[`${room}`];
    }

    join = (room, player) => {
        if (!this.games[`${room}`]) {
            const error = new Error('The room doesn\'t exist');
            error.isFull = false;
            throw error;
        }

        return this.games[`${room}`].join(player);
    }

    leave = (room, player) => {
        if (this.games[`${room}`]) {
            this.games[`${room}`].leave(player);
        } else {
            throw new Error('The room doesn\'t exist');
        }
    }

    abort = (room, player) => {
        this.isAdmin(room, player);
        delete this.games[`${room}`];
    }

    isAdmin = (room, player) => {
        if (!this.games[`${room}`]) {
            throw new Error('The room doesn\'t exist');
        } else if (!this.games[`${room}`].isAdmin(player)) {
            throw new Error('You don\'t have the permission for this action');
        }
    }

    ready = (room, player) => {
        this.isAdmin(room, player);
        return this.games[`${room}`].ready();
    }

    eat = (room, player, is_special) => {
        if (this.games[`${room}`]) {
            this.games[`${room}`].eat(player, is_special);
        } else {
            throw new Error('The room doesn\'t exist');
        }
    }

    count = () => Object.keys(this.games).length;
}

// class Room {
//     constructor (room, game) {
//         this.game = game;
//         this.room = room
//     }
// }

// class Manager {
//     constructor () {
//         this.rooms = new Set();
//     }

//     has = (room) => {
//         this.rooms = new 
//     }
// }

module.exports = ServerService;