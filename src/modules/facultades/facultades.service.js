import Facultad from './facultades.model.js';

export async function listarFacultades() {
    return await Facultad.find().sort({ nombre: 1 });
}

export async function listarFacultadPorId(id) {
    return await Facultad.find().sort({ nombre: 1 });

}

export async function obtenerFacultadPorId(id) {
    return await Facultad.findById(id);
}

export async function crearFacultad(nombre) {
  return await Facultad.create({ nombre });

    
}export async function actualizarFacultad(id, nombre) {
    return await Facultad.findByIdAndUpdate(id, { nombre },
        {returnDocument: 'after' , runValidators: true});
}

export async function eliminarFacultad(id) {
    const eliminada = await Facultad.findByIdAndDelete(id);
    return eliminada !== null;
}
