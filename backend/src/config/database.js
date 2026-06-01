const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'arriendos360_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'tu_contraseña',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, testConnection };