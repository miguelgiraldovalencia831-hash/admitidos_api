import crypto from "crypto";

/* Si no hay JWT_SECRET en el .env, se usa esta clave de desarrollo */
const SECRETO = process.env.JWT_SECRET || "clave-de-desarrollo-admitidos-2026";

/* ---------- Contraseñas ---------- */

export function cifrarPassword(password) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

export function verificarPassword(password, guardado) {
  const [sal, hash] = guardado.split(":");
  const calculado = crypto.scryptSync(password, sal, 64);
  const original = Buffer.from(hash, "hex");
  return original.length === calculado.length && crypto.timingSafeEqual(calculado, original);
}

/* ---------- Token JWT ---------- */

function codificar(objeto) {
  return Buffer.from(JSON.stringify(objeto)).toString("base64url");
}

function firmar(contenido) {
  return crypto.createHmac("sha256", SECRETO).update(contenido).digest("base64url");
}

export function crearToken(datos) {
  const ahora = Math.floor(Date.now() / 1000);
  const horas = Number(process.env.JWT_EXPIRES_HORAS) || 8;

  const encabezado = codificar({ alg: "HS256", typ: "JWT" });
  const cuerpo = codificar({ ...datos, iat: ahora, exp: ahora + horas * 3600 });
  const firma = firmar(`${encabezado}.${cuerpo}`);

  return `${encabezado}.${cuerpo}.${firma}`;
}

export function verificarToken(token) {
  try {
    const [encabezado, cuerpo, firma] = token.split(".");
    const esperada = firmar(`${encabezado}.${cuerpo}`);

    const a = Buffer.from(firma);
    const b = Buffer.from(esperada);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const datos = JSON.parse(Buffer.from(cuerpo, "base64url").toString());
    if (datos.exp < Math.floor(Date.now() / 1000)) return null;

    return datos;
  } catch {
    return null;
  }
}