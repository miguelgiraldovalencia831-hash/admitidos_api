import db from "../../config/database.js";

export async function listarProgramas() {
    const [rows] = await db.execute(`SELECT *
                                          FROM programas
                                          ORDER BY nombre ASC`);
    return rows;
}




export async function obtenerFacultadPorId(id) {
    const [rows] = await db.execute(`SELECT
                                          id,
                                          nombre,
                                          created_at AS createdAt,
                                          updated_at AS updatedAt
                                          FROM facultades
                                          WHERE id = ?`, [id]);
    return rows[0];
}

export async function crearFacultad(nombre) {
    const [result] = await db.execute(`INSERT INTO facultades (nombre) 
                                       VALUES (?)`, [nombre]);

    return result.insertId;
}


export async function actualizarFacultad(id, nombre) {
    await db.execute(`UPDATE facultades SET nombre = ? WHERE id = ?`, [nombre, id]);

    return obtenerFacultadPorId(id);
}

export async function eliminarFacultad(id) {
    const [result] = await db.execute(`DELETE FROM facultades WHERE id = ?`, [id]);

    return (
        result.affectedRows > 0  /* Devuelve el número de filas afectadas */
    );
}