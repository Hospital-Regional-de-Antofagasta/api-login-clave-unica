const supertest = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { getMensajes } = require("../config");
const ConfigApiLogin = require("../models/ConfigApiLogin");
const configSeed = require("../testSeeds/configSeed.json");

const request = supertest(app);

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI_TEST}clave_unica_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await ConfigApiLogin.create(configSeed);
});

afterEach(async () => {
  await ConfigApiLogin.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints clave unica", () => {
  describe("Generate state token and return client_id", () => {
    it("Should generate state token and return client_id", async (done) => {
      const response = await request.get("/toapp/datos-clave-unica");

      expect(response.status).toBe(200);
      expect(response.body.clientId).toBeTruthy();
      expect(response.body.state).toBeTruthy();

      done();
    });
  });
  describe("Generate sesion token from clave unica authentication", () => {
    it("Should not generate token from invalid state token", async (done) => {
      const response = await request.get(
        "/toapp?code=c40a748e828843d48b8ae52dd9d3b238&state=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbkNsYXZlVW5pY2EiOiJUb2tlbkNsYXZlVW5pY2EiLCJpYXQiOjE2MjAzOTk1NTEsImV4cCI6MTYyMDQwMDQ1MX0.o0-L5efmYHmefEIgT9LJJ-YWuWRYBL_Egve4u3myxm8"
      );

      const mensaje = await getMensajes("unauthorized");

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
  });
});
