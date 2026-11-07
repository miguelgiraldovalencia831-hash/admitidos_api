import mongoose from "mongoose";

const programasSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true, /* lo genera el sistema, no se repite */
      trim: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150
    },
    nivel: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["pregrado", "posgrado", "otro"] /* solo deja estos 3 valores */
    },
    facultad: {
      type: mongoose.Schema.Types.ObjectId, /* guarda el _id de la facultad */
      ref: "Facultades",                    /* y dice de qué modelo viene */
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* no se puede repetir el mismo nombre dentro de la misma facultad */
programasSchema.index({ nombre: 1, facultad: 1 }, { unique: true });

export default mongoose.model("Programas", programasSchema, "programas");