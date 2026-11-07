import express from "express";

const app = express();

app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes

const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;
const APP_NAME = process.env.APP_NAME;

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });
});

/* const products= [
    { id: 1, name: "Product 1", price: 10.99 },
    { id: 2, name: "Product 2", price: 19.99 },
    { id: 3, name: "Product 3", price: 5.99 },
];


app.get("/api/products", (req, res) => {
    res.json({
        statuscode: 200,
        data: products
    });
});
*/
const facultades = [
    { id: 1, name: "Facultad de Ingeniería" },
    { id: 2, name: "Facultad de Ciencias Sociales" },
    { id: 3, name: "Facultad de Ciencias de la Salud" },
    { id: 4, name: "Facultad de Arquitectura y urbanismo" }

];

const programas = [
    { id: 1, codigo: "IS", facultadId: 1, name: "Ingeniería de Sistemas", nivel: "Pregrado", CreateBy: "System", createdAt: new Date().toISOString() },
    { id: 2, codigo: "IC", facultadId: 1, name: "Ingeniería civil", nivel: "Pregrado", CreateBy: "System", createdAt: new Date().toISOString() },
    { id: 3, codigo: "II", facultadId: 1, name: "Ingeniería Industrial", nivel: "Pregrado", CreateBy: "System", createdAt: new Date().toISOString() },
    { id: 4, codigo: "PS", facultadId: 2, name: "Psicología", nivel: "Pregrado", CreateBy: "System", createdAt: new Date().toISOString() }

];

const nivelesPermitidos = [
    "pregrado",
    "posgrado",
    "otros"

]

let nextProgramId = 5;



const newProgram = {
    id: nextProgramId++,
    codigo,
    facultadId,
    name,
    nivel,
    CreateBy: "System",
    createdAt: new Date().toISOString()
};

programas.push(newProgram);


app.get("/api/facultades", (req, res) => {
    res.json({
        statuscode: 200,
        data: facultades
    });
});

app.get("/api/programas", (req, res) => {
    res.json({
        statuscode: 200,
        data: programas
    });
});

app.post("/api/programas/store", (req, res) => {
    console.log(req.body);

    const {
        facultadId,
        name,
        nivel
    } = req.body;

    if (!facultadId || !name || !nivel) {

        return res.status(422).json({

            statuscode: 422,

            success: false,

            message: "Los campos 'facultadId', 'name' y 'nivel' son obligatorios."
        });
    }


    const facultadExists = facultades.some(facultad => facultad.id === facultadId);

    if (!facultadExists) { /* 404 Not Found */
        return res.status(404).json({
            statuscode: 404,
            success: false,
            message: `La facultad con el id ${facultadId} no existe`
        });
    }

    if (
        !nivelesPermitidos.includes(
            nivel.toLowerCase()
        )
    ){

        return res.status(422).json({

            statuscode: 422,

            success: false,

            message: 
            "El nivel debe ser pregrado, posgrado u otros."
        });
    }

    const nombreNormalizado = 
    name
    .trim()
    .toLowerCase();

    const programaExists = 
    programas.some(

        programa =>

            programa.facultadId === 
            Number(facultadId) 
            &&

            programa.name
            .trim()
            .toLowerCase() 
            === nombreNormalizado
    );
    
    if (programaExists) {

        return res.status(409).json({

            statuscode: 409,
            
            success: false,
            
            message:
            "Ya existe un programa con ese nombre dentro de la facultad"
        });
    }

    const codigo = 
    `PROG-${String(
        nextProgramId
    ).padStart(4, "0")}`;

    const newProgram = {
        id: nextProgramId,
        codigo,
        facultadId:Number(facultadId),
        name: name.trim(),
        nivel: nivel.toLowerCase(),
        CreateBy: "System",
        createdAt: new Date().toISOString()
    };
    programas.push(newProgram);
    nextProgramId++;

    return res.status(201).json({
        statuscode: 201,
        success: true,
        message: "Programa creado correctamente",
        data: newProgram
    });
});

app.listen(PORT, HOST, () => {
    console.log(APP_NAME);
    console.log(`Server is running on http://${HOST}:${PORT}`);

});