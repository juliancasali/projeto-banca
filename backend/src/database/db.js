const mongoose = require('mongoose');
require('dotenv').config()
const seedAdmin = require('./seedAdmin')

// Conexão com MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB conectado');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Finaliza o processo caso haja erro crítico
    }

    // verifica a criação de admin
    //if (process.env.CREATE_ADMINS === 'true') {
  //      await seedAdmin();
  //  }

}

// Eventos para monitorar conexão
mongoose.connection.on('connected', () => console.log('MongoDB Connected'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

module.exports = connectDB;