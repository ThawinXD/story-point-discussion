import express from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cors from 'cors';

dotenv.config({path: '.env'});

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const server = app.listen(PORT, console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

export { app, server, io };

// Initialize socket handlers after exports
import { initializeSocketHandlers } from './io.js';
initializeSocketHandlers(io);