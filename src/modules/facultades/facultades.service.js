import db from "../../config/database.js";

export async function listarFacultades() {
    const [rows] = await db.execute(
        `SELECT
            id,
            nombre,
            created_at AS createdAt,
            updated_at AS updatedAt
         FROM facultades
         ORDER BY nombre ASC`
    );
    return rows;
}