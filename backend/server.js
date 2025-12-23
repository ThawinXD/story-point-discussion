import express from 'express';
import dotenv from 'dotenv';

dotenv.config({path: '.env'});

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const server = app.listen(PORT, console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`));


export { app, server };