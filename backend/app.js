const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./src/database/db');
const cors = require('cors');

const userRouter = require('./src/routes/userRouter');
const professorRouter = require('./src/routes/professorRouter');
const bancaRouter = require('./src/routes/bancaRouter');

const app = express();

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// cors
app.use(cors({origin: "http://localhost:5000" }));


// conectar ao banco de dados
connectDB().then(() => console.log("Database connected successfully "));

// Rotas
app.use('/api/auth', userRouter)
app.use('/api/professores', professorRouter)
app.use('/api/bancas', bancaRouter)

// Exporta o aplicativo
module.exports = app;
