import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const APP_NAME = process.env.APP_NAME || "Admitidos API";

app.listen(PORT, HOST, () => {
    console.log(APP_NAME);
    console.log(`Server is running on http://${HOST}:${PORT}`);
});