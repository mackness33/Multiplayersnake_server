const GameService = require('./gameService');
const SupabaseService = require('./supabaseService');

class ServerService {
    constructor () {
        this._games = {};
        this._database = new SupabaseService();

        this._database.init();
    }

    create = (rules) => {
        if (this._games[`${rules.room}`]) {
            throw new Error('Room already in use');
        }

        this._games[`${rules.room}`] = new GameService(rules);
    }

    remove = (room) => {
        delete this._games[`${room}`];
    }

    join = (room, player) => {
        if (!this._games[`${room}`]) {
            const error = new Error('The room doesn\'t exist');
            error.isFull = false;
            throw error;
        }

        return this._games[`${room}`].join(player);
    }

    leave = (room, player) => {
        if (this._games[`${room}`]) {
            this._games[`${room}`].leave(player);
        } else {
            throw new Error('The room doesn\'t exist');
        }
    }

    abort = (room, player) => {
        this.isAdmin(room, player);
        this.remove(room);
    }

    isAdmin = (room, player) => {
        if (!this._games[`${room}`]) {
            throw new Error('The room doesn\'t exist');
        } else if (!this._games[`${room}`].isAdmin(player)) {
            throw new Error('You don\'t have the permission for this action');
        }
    }

    ready = (room, player) => {
        this.isAdmin(room, player);
        return this._games[`${room}`].ready();
    }

    eat = (room, player, is_special) => {
        if (this._games[`${room}`]) {
            return this._games[`${room}`].eat(player, is_special);
        } else {
            throw new Error('The room doesn\'t exist');
        }
    }

    end = (room, player) => {
        if (this._games[`${room}`]) {
            return this._games[`${room}`].end(player);
        } else {
            throw new Error('The room doesn\'t exist');
        }
    }

    count = () => Object.keys(this._games).length;

    save_game = (room) => {
        let game;
        if (game = this._games[`${room}`]) {
            return this._database.create_game(game.array_players, game.rules, room);
        } else {
            throw new Error('The room doesn\'t exist');
        }
    }

    exists = (room) => {
        return this._games[`${room}`] ?? false
    }
}

module.exports = ServerService;