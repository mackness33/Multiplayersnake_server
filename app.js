import express from 'express';

const app = express();
const server = app.listen(PORT, ()=> {
    console.log(`listening to: ${PORT}`);
})

import { on } from 'socket.io';

on('connection', (socket) => {
    console.log("Connected successfully", socket.id);
})