const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables del archivo .env

// Configuración dinámica usando variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME || 'arriendos360_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'tu_contraseña',
  {
    // Cuando usamos Docker, el HOST debe ser el nombre del servicio en docker-compose (db)
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'postgres', // Cambia a 'mysql' si Laura usó MySQL
    logging: false,      // Para que la consola esté limpia
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

testConnection();

module.exports = sequelize;