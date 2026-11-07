import app from "./app.js";
import { connectDB } from "./config/database.js";


const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;
const APP_NAME = process.env.APP_NAME;


async function startServer() {
    try {
        await connectDB(); /* nos conectamos a MongoDB */
        console.log("Base de datos conectada correctamente");

        app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT} (${APP_NAME})`);
        });
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}

startServer();