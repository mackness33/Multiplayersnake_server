const supabase = require('@supabase/supabase-js').createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_PSW, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
});

class SupabaseService {
    init = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: process.env.SUPABASE_MAIL,
            password: process.env.SUPABASE_PSW,
        })

        if (error && error !== null) console.error(error);
    }

    create_game = async (players, rules, room) => {
        const players_ids = await this.get_players_id(players.map((player) => player.email)); 
        const game = {
            name: room,
            max_time: rules.max_time,
            max_players: rules.max_players,
        };

        if (!players_ids) {
            throw Error('error on getting the players');
        }

        for (let index = 0; index < players.length; index++) {
            game[`player${index}`] = players_ids[index].id;
            game[`player${index}_points`] = players[index].points;
        }

        const { data, error } = await supabase
            .from('games')
            .insert(game).select(`
                id,
                name,
                max_time,
                player0(email),
                player0_points,
                player1(email),
                player1_points,
                player2(email),
                player2_points,
                player3(email),
                player3_points
            `);

        if (error && error !== null) {
            console.error(error)
            throw Error(error);
        };

        console.log(`Inserting the game: ${room}`);

        return data;
    }

    get_players_id = async (players) => {
        const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .in('email', players);

        if (error && error !== null) {
            console.error(error)
            throw Error(error);
        };

        return data;
    }

}

module.exports = SupabaseService;