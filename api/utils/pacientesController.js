const axios = require("axios");
const { signToken } = require("../utils/auth");
const fakeGetPacientesById = require("../../tests/apiResponses/getPacienteById.json");
const fakeGetPacientesByRut = require("../../tests/apiResponses/getPacienteByRut.json");

const secretToken = process.env.JWT_SECRET;

const expiresIn = 60 * 1 * 1 * 1;

const urlPacientes = process.env.API_URL;

exports.getPacienteByRut = async (rutPaciente) => {
  const token = signToken(
    { _id: null, rut: rutPaciente },
    expiresIn,
    secretToken
  );

  const config = {
    headers: {
      Authorization: `${token}`,
    },
  };

  if (process.env.NODE_ENV === "test") {
    return fakeGetPacientesByRut;
  }

  const response = await axios.get(
    `${urlPacientes}/v1/pacientes/informacion?filter=rut`,
    config
  );

  return response.data;
};
