class GameService {
    constructor (rules) {
        this.admin = rules.player;
        this.players = new Set();
        this.players.add(new Player(this.admin));
        this.rules = new Configuration(rules);
    }

    get players_emails () {
        return this._array_players.map(player => player.email);
    }

    get players_ending () {
        return this._array_players.map(player => player.ended);
    }

    get have_all_players_ended_game () {
        return this.players_ending.reduce((prevValue, currValue) => prevValue && currValue)
    }

    get _array_players () { return [...this.players] };

    set _new_players (array) { this.players = new Set(array); }

    join = (player) => {
        if (this.players.size >= this.rules.max_players) {
            const error = new Error('The room is full');
            error.isFull = true;
            throw error;
        } else if (this.players_emails.includes(player)) {
            const error = new Error('The player is already inside');
            error.isFull = false;
            throw error;
        }

        this.players.add(new Player(player));

        return {rules: this.rules.toJson(), players: this.players_emails, admin: this.admin};
    }

    leave = (player_email) => {
        if (this.players_emails.contains(player_email)) {
            this.players = new Set(this._array_players.filter(player => player.email !== player_email));
        } else {
            throw new Error('The player is not part of the room');
        }
    }

    end = (player_email) => {
        const index = this.players_emails.indexOf(player_email);
        if (index > -1 && !this._array_players[index].ended) {
            this.players[index].ended = true;
        }

        if (have_all_players_ended_game) {
            Promise.resolve(this.promised_end_game);
        }
    }

    ready = async () => {
        // this.promised_end_game = {
        //     then(onFulfilled) {
        //         onFulfilled();
        //     },
        // };

        this.promised_end_game = new Promise();

        return this.promised_end_game;
    }

    isAdmin = (player) => {
        return this.admin === player;
    }
}

class Player {
    constructor (email) {
        this.email = email;
        this.ended = false;
    }
}

class Configuration {
    constructor (rules) {
        this.max_players = rules.maxPlayers;
        this.index_players = rules.indexPlayers;
        this.index_time = rules.indexTime;
        this.index_points = rules.indexPoints;
        this.public = rules.public;
    }

    toJson = () => {
        return {
            indexPlayers: this.index_players,
            indexTime: this.index_time,
            indexPoints: this.index_time,
            public: this.public,
        }
    }
}

module.exports = GameService;