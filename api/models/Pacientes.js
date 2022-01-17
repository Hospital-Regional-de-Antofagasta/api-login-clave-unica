const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Paciente = mongoose.model(
  "paciente",
  new Schema({
    // numeroPaciente: Number,
    rut: { type: String, require: true, unique: true },
    nombreSocial: String,
    nombre: { type: String, require: true },
    apellidoPaterno: { type: String, require: true },
    apellidoMaterno: { type: String, require: true },
    detallesDireccion: String,
    direccionNumero: String,
    direccion: String,
    direccionPoblacion: String,
    codigoComuna: String,
    codigoCiudad: String,
    codigoRegion: String,
    telefonoFijo: String,
    telefonoMovil: String,
    correoCuerpo: String,
    correoExtension: String,
    codigosEstablecimientos: [String],
    datosContactoActualizados: { type: Boolean, default: false },
  })
);

module.exports = Paciente;
