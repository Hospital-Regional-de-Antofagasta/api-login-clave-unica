const supertest = require("supertest");
const app = require("../api/app");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { getMensajes } = require("../api/config");
const ConfigApiLogin = require("../api/models/ConfigApiLogin");
const configSeed = require("./testSeeds/configSeed.json");
const UsuariosInternos = require("../api/models/UsuariosInternos");
const RefreshTokenInterno = require("../api/models/RefreshTokenInterno");
const usuariosInternosSeed = require("./testSeeds/usuariosInternosSeed.json");
const refreshTokensInternosSeed = require("./testSeeds/refreshTokensInternosSeed.json");

const request = supertest(app);

const secretoInterno = process.env.JWT_SECRET_INTERNO;

const secretRefreshTokenInterno = process.env.JWT_SECRET_REFRESH_TOKEN_INTERNO;

const userId = "61832a43c8a4d50009607cab";

const tokenInterno = jwt.sign(
  {
    _id: userId,
  },
  secretoInterno
);

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI}/auth_interno_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await UsuariosInternos.create(usuariosInternosSeed);
  await RefreshTokenInterno.create(refreshTokensInternosSeed);
  await ConfigApiLogin.create(configSeed);
});

afterEach(async () => {
  await UsuariosInternos.deleteMany();
  await RefreshTokenInterno.deleteMany();
  await ConfigApiLogin.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints auth", () => {
  describe("Post /registrar", () => {
    it("Should not create new user without a token", async (done) => {
      const response = await request.post("/v1/auth-interno/registrar");

      const mensaje = await getMensajes("forbiddenAccess");

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
    it("Should not create new user without a valid token", async (done) => {
      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", "token-no-valido");

      const mensaje = await getMensajes("forbiddenAccess");

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
    it("Should not create new user if recieved data is null", async (done) => {
      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno);

      const mensaje = await getMensajes("invalidUserName");

      expect(response.status).toBe(400);
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
    it("Should not create new user if userName name is invalid", async (done) => {
      const postData = {
        userName: "u",
        password: "encrypted",
      };

      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("invalidUserName");

      expect(response.status).toBe(400);
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
    it("Should not create new user if userName name alredy exists", async (done) => {
      const postData = {
        userName: "admin",
        password: "encrypted",
      };

      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("userAlredyExists");

      expect(response.status).toBe(400);
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
    it("Should not create new user if password has invalid length", async (done) => {
      const postData = {
        userName: "usuario11",
        password: "123Asd!",
      };

      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("invalidPassword");

      expect(response.status).toBe(400);
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
    it("Should not create new user if password has invalid caracters", async (done) => {
      const postData = {
        userName: "usuario11",
        password: "asd123asd",
      };

      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("invalidPassword");

      expect(response.status).toBe(400);
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
    it("Should create new user", async (done) => {
      const postData = {
        userName: "usuario5",
        password: "encrypteD1!",
      };

      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno)
        .send(postData);

      const usuario = await UsuariosInternos.findOne({ userName: "usuario5" }).exec();

      const mensaje = await getMensajes("userCreated");

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(usuario).toBeTruthy()

      done();
    });
    it("Should create new user from deleted user", async (done) => {
      const postData = {
        userName: "usuario6",
        password: "encrypteD1!",
      };

      const response = await request
        .post("/v1/auth-interno/registrar")
        .set("Authorization", tokenInterno)
        .send(postData);

      const usuario = await UsuariosInternos.findOne({ userName: "usuario6" }).exec();

      const mensaje = await getMensajes("userCreated");

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(usuario).toBeTruthy()

      done();
    });
  });
  describe("Put /cambiar-contrasenia", () => {
    it("Should not change user pasword without a token", async (done) => {
      const response = await request.put("/v1/auth-interno/cambiar-contrasenia");

      const mensaje = await getMensajes("forbiddenAccess");

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
    it("Should not change user pasword without a valid token", async (done) => {
      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia")
        .set("Authorization", "token-no-valido");

      const mensaje = await getMensajes("forbiddenAccess");

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
    it("Should not change user password if recieved data is null", async (done) => {
      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia")
        .set("Authorization", tokenInterno);

      const mensaje = await getMensajes("invalidPassword");

      expect(response.status).toBe(400);
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
    it("Should not change user password if password has invalid length", async (done) => {
      const postData = {
        password: "123Asd!",
      };

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("invalidPassword");

      expect(response.status).toBe(400);
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
    it("Should not change user password if password has invalid caracters", async (done) => {
      const postData = {
        password: "asd123asd",
      };

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("invalidPassword");

      expect(response.status).toBe(400);
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
    it("Should change user password", async (done) => {
      const postData = {
        password: "encrypteD1!",
      };

      const usuarioAntes = await UsuariosInternos.findById(userId).exec();

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("passwordChanged");

      const usuarioDespues = await UsuariosInternos.findById(userId).exec();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(usuarioAntes.password).not.toBe(usuarioDespues.password)

      done();
    });
  });
  describe("Delete /", () => {
    it("Should not user without a token", async (done) => {
      const response = await request.post("/v1/auth-interno/eliminar-usuario");

      const mensaje = await getMensajes("forbiddenAccess");

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
    it("Should not delete user without a valid token", async (done) => {
      const response = await request
        .post("/v1/auth-interno/eliminar-usuario")
        .set("Authorization", "token-no-valido");

      const mensaje = await getMensajes("forbiddenAccess");

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
    it("Should not delete user without a user to delete", async (done) => {
      const response = await request
        .post("/v1/auth-interno/eliminar-usuario")
        .set("Authorization", tokenInterno);

      const mensaje = await getMensajes("invalidUserName");

      expect(response.status).toBe(400);
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
    it("Should delete user", async (done) => {
      const postData = {
        userName: "admin"
      };

      const response = await request
        .post("/v1/auth-interno/eliminar-usuario")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("userDeleted");

      const usuario = await UsuariosInternos.findOne({ userName: "admin" }).exec();

      const refreshToken = await RefreshTokenInterno.findOne({
        user_id: usuario._id,
        revoked: null,
      }).exec();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(usuario.role).toBeFalsy()
      expect(refreshToken).toBeFalsy()

      done();
    });
  });
  describe("Post /login", () => {
    it("Should not generate new token if recieved data is null", async (done) => {
      const response = await request.post("/v1/auth-interno/login");

      const mensaje = await getMensajes("invalidLoginData");

      expect(response.status).toBe(400);
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
    it("Should not generate new token if recieved user name is invalid", async (done) => {
      const postData = {
        userName: "usuario123",
        password: "encrypteD1",
      };
      const response = await request
        .post("/v1/auth-interno/login")
        .send(postData);

      const mensaje = await getMensajes("invalidLoginData");

      expect(response.status).toBe(400);
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
    it("Should not generate new token if recieved password is invalid", async (done) => {
      const postData = {
        userName: "admin",
        password: "encrypteD1",
      };
      const response = await request
        .post("/v1/auth-interno/login")
        .send(postData);

      const mensaje = await getMensajes("invalidLoginData");

      expect(response.status).toBe(400);
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
      const postData = {
        userName: "admin",
        password: "encrypteD1!",
      };
      const response = await request
        .post("/v1/auth-interno/login")
        .send(postData);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();

      done();
    });
  });
  describe("Post /refresh-token", () => {
    it("Should not generate new token if there is not a refresh token", async (done) => {
      const response = await request.post(
        "/v1/auth-interno/refresh-token"
      );

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
        .post("/v1/auth-interno/refresh-token")
        .set("Cookie", "refresh_token=no-token");

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
      await RefreshTokenInterno.deleteMany();
      const refresh_token = jwt.sign(
        { refreshTokenKey: "I am not in the db" },
        secretRefreshTokenInterno
      );
      const response = await request
        .post("/v1/auth-interno/refresh-token")
        .set("Cookie", `refreshToken=${refresh_token}`);

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
        secretRefreshTokenInterno
      );
      const response = await request
        .post("/v1/auth-interno/refresh-token")
        .set("Cookie", `refreshToken=${refresh_token}`);

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
        secretRefreshTokenInterno
      );
      const response = await request
        .post("/v1/auth-interno/refresh-token")
        .set("Cookie", `refreshToken=${refresh_token}`);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();

      done();
    });
  });
});
