const mongoose = require('mongoose')
const Schema = mongoose.Schema

// console.log('Estado Coneccion', mongoose.connection.readyState);


const Paciente = mongoose.model('Paciente', new Schema ({
    PAC_PAC_Numero: Number,
    PAC_PAC_Rut: String,
    PAC_PAC_ApellPater: String,
    PAC_PAC_ApellMater: String,
    PAC_PAC_Nombre: String,
    PAC_PAC_CalleHabit: String,
    PAC_PAC_NumerHabit: String,
    PAC_PAC_DeparHabit: String,
    PAC_PAC_PoblaHabit: String,
    PAC_PAC_ComunHabit: String,
    PAC_PAC_CiudaHabit: String,
    PAC_PAC_RegioHabit: String,
    PAC_PAC_Fono: String,
    PAC_PAC_TelefonoMovil: String,
    PAC_PAC_CorreoCuerpo: String,
    PAC_PAC_CorreoExtension: String,
}), 'PAC_Paciente')

module.exports = Paciente