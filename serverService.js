const GameService = require('./gameService');

class ServerService {
    constructor () {
        this.games = {};
    }

    create = (rules) => {
        if (this.games[`${rules.name}`]) {
            throw new Error('Room already in use');
        }

        this.games[`${rules.name}`] = new GameService(rules);
    }

    remove = (name) => {
        delete this.games[`${name}`];
    }

    join = (name, player) => {
        if (!this.games[`${name}`]) {
            const error = new Error('The room doesn\'t exist', false);
            error.isFull = false;
            throw error;
        }

        return this.games[`${name}`].join(player);
    }

    leave = (name, player) => {
        this.games[`${name}`].leave(player);
    }
}

module.exports = ServerService;