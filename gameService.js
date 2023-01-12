class GameService {
    constructor (rules) {
        this.admin = rules.player;
        this.players = new Set();
        this.players.add(new Player(this.admin));
        this.rules = new Configuration(rules);
    }

    get players_emails () {
        return this.array_players.map(player => player.email);
    }

    get players_ending () {
        return this.array_players.map(player => player.ended);
    }

    get have_all_players_ended_game () {
        return this.players_ending.reduce((prevValue, currValue) => prevValue && currValue)
    }

    get array_players () { return [...this.players] };

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
        if (this.players_emails.includes(player_email)) {
            this.players = new Set(this.array_players.filter(player => player.email !== player_email));
        } else {
            throw new Error('The player is not part of the room');
        }
    }

    end = (player_email) => {
        console.log('in END!!');
        const index = this.players_emails.indexOf(player_email);
        if (index > -1 && !this.array_players[index].ended) {
            this.array_players[index].ended = true;
        }

        return this.have_all_players_ended_game;
    }

    ready = () => {
        // if (this.rules.max_players === this.players.size) {
            return {game_end: this.countdown(), players: this.players_emails};
        // }

        // return {};
    }

    countdown = ()  => {
        const max_time = ((this.rules.max_time * 60) + 10); // in seconds
        return new Promise((resolve, _) => {
            setTimeout(() => {
                    resolve(this.rules.max_time !== 0);
                }, max_time * 1000);
            }
        );
    }

    eat = (player_email, is_special) => {
        const index = this.players_emails.indexOf(player_email);
        if (index > -1) {
            this.array_players[index].points += (is_special) ? 3 : 1;
            return this.rules.max_points && this.array_players[index].points >= this.rules.max_points;
        } else {
            throw new Error('The player is not part of the room');
        }
    }

    is_admin = (player) => {
        return this.admin === player;
    }
}

class Player {
    constructor (email) {
        this.email = email;
        this.points = 0;
        this.ended = false;
    }

    eat = (is_special) => this.points += (is_special) ? 3 : 1;
}

class Configuration {
    constructor (rules) {
        this.max_players = rules.maxPlayers;
        this.index_players = rules.indexPlayers;
        this.index_time = rules.indexTime;
        this.index_points = rules.indexPoints;
        this.public = rules.public;
        this.max_time = rules.maxTime;
        this.max_points = rules.maxPoints;
    }

    toJson = () => {
        return {
            indexPlayers: this.index_players,
            indexTime: this.index_time,
            indexPoints: this.index_time,
            public: this.public,
        }
    }

    getRules = () => {
        return {
            max_players: this.max_players,
            max_time: this.max_time,
            max_points: this.max_points,
            public: this.public,
        }
    }
}

module.exports = GameService;