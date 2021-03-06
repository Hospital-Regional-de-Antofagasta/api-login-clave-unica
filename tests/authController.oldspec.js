const app = require("../api/app");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authController = require("../api/controller/authController");
const { getMensajes } = require("../api/config");
const ConfigApiLogin = require("../api/models/ConfigApiLogin");
const configSeed = require("./testSeeds/configSeed.json");

const secretToken = process.env.JWT_SECRET;

const secretRefreshToken = process.env.JWT_SECRET_REFRESH_TOKEN;

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI}/auth_controller_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await ConfigApiLogin.create(configSeed);
});

afterEach(async () => {
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
    // it("Should not generate token for paciente that does not exist", async (done) => {
    //   const req = {
    //     body: pacienteNoIngresado,
    //     headers: [],
    //     connection: { remoteAddress: "123" },
    //   };
    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     send: jest.fn(),
    //   };

    //   await authController.login(req, res);

    //   expect(res.status.mock.calls).toEqual([[401]]);

    //   expect(res.send.mock.calls).toEqual([
    //     [{ respuesta: await getMensajes("unauthorized") }],
    //   ]);

    //   done();
    // });
    // it("Should generate token for paciente that exists", async (done) => {
    //   const req = {
    //     body: pacienteIngresado,
    //     headers: [],
    //     connection: { remoteAddress: "123" },
    //   };
    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     send: jest.fn(),
    //   };

    //   await authController.login(req, res);

    //   expect(res.status.mock.calls).toEqual([[200]]);

    //   expect(res.send.mock.calls[0][0].token).toBeTruthy();
    //   expect(res.send.mock.calls[0][0].refresh_token).toBeTruthy();
    //   expect(res.send.mock.calls[0][0].nombre_completo).toBeTruthy();

    //   const token = res.send.mock.calls[0][0].token;

    //   const resultToken = await new Promise((resolve, reject) => {
    //     jwt.verify(token, secretToken, (err, decoded) => {
    //       if (err) return resolve(false);
    //       return resolve(decoded);
    //     });
    //   });

    //   expect(resultToken.rut).toBe("10771131-7")

    //   const refreshToken = res.send.mock.calls[0][0].refresh_token;

    //   const resultRefreshToken = await new Promise((resolve, reject) => {
    //     jwt.verify(refreshToken, secretRefreshToken, (err, decoded) => {
    //       if (err) return resolve(false);
    //       return resolve(decoded);
    //     });
    //   });

    //   expect(resultRefreshToken.refreshTokenKey).toBeTruthy()

    //   done();
    // });
    // it("Should not generate token with empty db", async (done) => {
    //   const req = {
    //     body: pacienteIngresado,
    //     headers: [],
    //     connection: { remoteAddress: "123" },
    //   };
    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     send: jest.fn(),
    //   };

    //   await authController.login(req, res);

    //   expect(res.status.mock.calls).toEqual([[401]]);

    //   expect(res.send.mock.calls).toEqual([
    //     [{ respuesta: await getMensajes("unauthorized") }],
    //   ]);

    //   done();
    // });
  });
});
