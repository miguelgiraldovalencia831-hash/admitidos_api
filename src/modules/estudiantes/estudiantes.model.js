import mongoose from "mongoose";

const estudiantesSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    documento: {
      type: String,
      required: true,
      trim: true,
      unique: true, /* no se pueden repetir documentos */
      minlength: 5,
      maxlength: 20
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, /* guarda el correo siempre en minúscula */
      unique: true,
      maxlength: 150
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model("Estudiantes", estudiantesSchema, "estudiantes");