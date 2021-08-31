const supertest = require("supertest");
const app = require("../api/app");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Pacientes = require("../api/models/Pacientes");
const RefreshToken = require("../api/models/RefreshToken");
const pacientesSeed = require("./testSeeds/pacientesSeed.json");
const refreshTokensSeed = require("./testSeeds/refreshTokensSeed.json");
const { getMensajes } = require("../api/config");
const ConfigApiLogin = require("../api/models/ConfigApiLogin");
const configSeed = require("./testSeeds/configSeed.json");

const request = supertest(app);

const secretRefreshToken = process.env.JWT_SECRET_REFRESH_TOKEN;

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI_TEST}auth_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Pacientes.create(pacientesSeed);
  await RefreshToken.create(refreshTokensSeed);
  await ConfigApiLogin.create(configSeed);
});

afterEach(async () => {
  await Pacientes.deleteMany();
  await RefreshToken.deleteMany();
  await ConfigApiLogin.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints auth", () => {
  describe("Generate new token from refresh  token", () => {
    it("Should not generate new token if there is not a refresh token", async (done) => {
      const response = await request.post("/v1/auth/refresh-token");

      const mensaje = await getMensajes("unauthorizedRefresh");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Should not generate new token if the refresh token is invalid", async (done) => {
      const response = await request
        .post("/v1/auth/refresh-token")
        .send({ refresh_token: "no-token" });

      const mensaje = await getMensajes("unauthorizedRefresh");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Should not generate new token if the refresh token is not on the db", async (done) => {
      await RefreshToken.deleteMany();
      const refresh_token = jwt.sign(
        { refreshTokenKey: "I am not in the db" },
        secretRefreshToken
      );
      const response = await request
        .post("/v1/auth/refresh-token")
        .send({ refresh_token });

      const mensaje = await getMensajes("unauthorizedRefresh");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Should not generate new token if the refresh token has been revoked", async (done) => {
      const refresh_token = jwt.sign(
        { refreshTokenKey: "I am revoked" },
        secretRefreshToken
      );
      const response = await request
        .post("/v1/auth/refresh-token")
        .send({ refresh_token });

      const mensaje = await getMensajes("unauthorizedRefresh");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Should generate new token", async (done) => {
      const refresh_token = jwt.sign(
        { refreshTokenKey: "I am a valid key" },
        secretRefreshToken
      );
      const response = await request
        .post("/v1/auth/refresh-token")
        .send({ refresh_token });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.refresh_token).toBeTruthy();

      done();
    });
  });
});
