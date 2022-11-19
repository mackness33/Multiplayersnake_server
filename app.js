const express = require('express');

const app = express();
const server = app.listen(PORT, ()=> {
    console.log(`listening to: ${PORT}`);
})

const io = require('socket.io');

io.on('connection', (socket) => {
    console.log("Connected successfully", socket.id);
})