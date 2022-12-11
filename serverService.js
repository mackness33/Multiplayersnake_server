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
            const error = new Error('The room doesn\'t exist');
            error.isFull = false;
            throw error;
        }

        return this.games[`${name}`].join(player);
    }

    leave = (name, player) => {
        this.games[`${name}`].leave(player);
    }

    isAdmin = (name, player) => {
        if (!this.games[`${name}`]) {
            const error = new Error('The room doesn\'t exist');
            throw error;
        } else if (this.games[`${name}`].admin !== player) {
            const error = new Error('You don\'t have the permission for this action');
            throw error;
        }
    }
}

module.exports = ServerService;