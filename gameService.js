class GameService {
    constructor (rules) {
        this.admin = rules.player;
        this.players = [this.admin];
        this.rules = rules;
    }

    join = (player) => {
        if (this.players.length >= max) {
            const error = new Error('The room is full');
            error.isFull = true;
            throw error;
        }

        this.players.push(player);

        return this.rules
    }

    leave = (player_email) => {
        this.player = this.players.filter(player => player !== player_email);
    }
}

module.exports = GameService;