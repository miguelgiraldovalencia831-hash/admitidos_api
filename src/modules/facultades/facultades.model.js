import mongoose from "mongoose";
const facultadesSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      tri: true,
      minlength: 3,
      maxlength: 150
    }
},
   {
       timestamps: true,
       versionKey: false
    }

);

export default mongoose.model("Facultades", facultadesSchema, "facultades");