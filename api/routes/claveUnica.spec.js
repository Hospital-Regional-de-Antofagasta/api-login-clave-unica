const supertest = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");
const { mensajes } = require("../config");

const request = supertest(app);

const clientId = process.env.CLIENT_ID;

const secretClaveUnica = process.env.JWT_SECRET_CLAVE_UNICA;

const expiresIn = 60 * 15 * 1 * 1; // seconds, minutes, hours, days

describe("Endpoints clave unica", () => {
  describe("Generate state token and return client_id", () => {
    it("Should generate state token and return client_id", async (done) => {
      const response = await request.get("/toapp/datos_clave_unica");

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

      expect(response.status).toBe(401);
      expect(response.body.respuesta).toBe(mensajes.unauthorized);

      done();
    });
  });
});
