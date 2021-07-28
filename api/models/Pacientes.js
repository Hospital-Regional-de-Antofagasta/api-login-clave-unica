const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Paciente = mongoose.model(
  "paciente",
  new Schema({
    numerosPaciente: [
      {
        numero: Number,
        codigoEstablecimiento: String,
        nombreEstablecimiento: String,
      }
    ],
    rut: String,
    apellidoPaterno: String,
    apellidoMaterno: String,
    nombre: String,
    direccionCalle: String,
    direccionNumero: String,
    direccionDepartamento: String,
    direccionPoblacion: String,
    codigoComuna: String,
    codigoCiudad: String,
    codigoRegion: String,
    fono: String,
    telefonoMovil: String,
    correoCuerpo: String,
    correoExtension: String,
    datosContactoActualizados: { type: Boolean, default: false },
    fechaFallecimiento: { type: Date, select: false},
    nombreSocial: String,
  })
);

module.exports = Paciente;
