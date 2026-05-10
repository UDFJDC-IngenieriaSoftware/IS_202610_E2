const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database"); // <--- Importamos la conexión

const app = express();

app.use(cors());
app.use(express.json());

// Sincronizar modelos con la base de datos (Laura podrá usar esto luego)
sequelize.sync({ force: false }) // force: false evita borrar los datos cada vez que reinicias
  .then(() => console.log("Tablas sincronizadas"))
  .catch(err => console.log("Error al sincronizar:", err));

app.get("/", (req, res) => {
  res.send("API de Arriendos360 funcionando y conectada a la BD 🚀");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});