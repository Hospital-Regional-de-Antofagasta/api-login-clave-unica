const mongoose = require("mongoose");
const authController = require("./authController");
const Pacientes = require("../models/Pacientes");
const pacientesSeed = require("../testSeeds/pacientesSeed.json");
const { getMensajes } = require("../config");
const ConfigApiLogin = require("../models/ConfigApiLogin");
const configSeed = require("../testSeeds/configSeed.json");

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI_TEST}auth_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Pacientes.create(pacientesSeed);
  await ConfigApiLogin.create(configSeed);
});

afterEach(async () => {
  await Pacientes.deleteMany();
  await ConfigApiLogin.deleteMany();
  await mongoose.connection.close();
});

const pacienteNoIngresado = {
  nombreCompleto: "nombre",
  rut: "1-1",
};

const pacienteIngresado = {
  nombreCompleto: "nombre",
  rut: "10771131-7",
};

describe("Function login", () => {
  describe("Generate token for user", () => {
    it("Should not generate token for paciente that does not exist", async (done) => {
      const req = {
        body: pacienteNoIngresado,
        headers: [],
        connection: { remoteAddress: "123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await authController.login(req, res);

      expect(res.status.mock.calls).toEqual([[401]]);

      expect(res.send.mock.calls).toEqual([
        [{ respuesta: await getMensajes("unauthorized") }],
      ]);

      done();
    });
    it("Should generate token for paciente that exists", async (done) => {
      const req = {
        body: pacienteIngresado,
        headers: [],
        connection: { remoteAddress: "123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await authController.login(req, res);

      expect(res.status.mock.calls).toEqual([[200]]);

      expect(res.send.mock.calls[0][0].token).toBeTruthy();
      expect(res.send.mock.calls[0][0].refresh_token).toBeTruthy();

      done();
    });
    it("Should not generate token with empty db", async (done) => {
      await Pacientes.deleteMany();
      const req = {
        body: pacienteIngresado,
        headers: [],
        connection: { remoteAddress: "123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await authController.login(req, res);

      expect(res.status.mock.calls).toEqual([[401]]);

      expect(res.send.mock.calls).toEqual([
        [{ respuesta: await getMensajes("unauthorized") }],
      ]);

      done();
    });
  });
});
