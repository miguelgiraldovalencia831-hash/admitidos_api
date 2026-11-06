import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const APP_NAME = process.env.APP_NAME;

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB connected");

        app.listen(PORT, HOST, () => {
            console.log(`${APP_NAME} corriendo en http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error("error al conectar a MongoDB:", error);
        
    }
}

startServer();