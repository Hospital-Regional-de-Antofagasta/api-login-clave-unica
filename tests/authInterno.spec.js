const supertest = require("supertest");
const app = require("../api/app");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { getMensajes } = require("../api/config");
const ConfigApiLogin = require("../api/models/ConfigApiLogin");
const configSeed = require("./testSeeds/configSeed.json");
const UsuariosInternos = require("../api/models/UsuariosInternos");
const RefreshTokenInterno = require("../api/models/RefreshTokenInterno");
const AuditLogging = require("../api/models/AuditLogging.js");
const usuariosInternosSeed = require("./testSeeds/usuariosInternosSeed.json");
const refreshTokensInternosSeed = require("./testSeeds/refreshTokensInternosSeed.json");

const request = supertest(app);

const secretoInterno = process.env.JWT_SECRET_INTERNO;

const secretRefreshTokenInterno = process.env.JWT_SECRET_REFRESH_TOKEN_INTERNO;

const userId = "61832a43c8a4d50009607cab";

const user = {
  _id: "61832a43c8a4d50009607cab",
  userName: "admin",
  role: "admin",
};

const tokenInterno = jwt.sign(
  {
    user,
  },
  secretoInterno
);

const expectAuditLog = async (action) => {
  const registro = await AuditLogging.findOne({
    userName: user.userName,
    userId: user._id,
    action,
  }).exec();

  expect(registro).toBeTruthy();
  expect(registro.affectedData.userName).toBeTruthy();
  expect(registro.createdAt).toBeTruthy();
}

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
  await AuditLogging.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints auth", () => {
  describe("Post /default-admin-user", () => {
    it("Should not generate new admin user if an admin user exists", async (done) => {
      const response = await request.post(
        "/v1/auth-interno/default-admin-user"
      );

      const mensaje = await getMensajes("adminExists");

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
    it("Should not generate new admin user if userName adminHrapp exists", async (done) => {
      await UsuariosInternos.updateOne(
        { userName: "admin" },
        { userName: "adminHrapp", role: "user" }
      );
      const response = await request.post(
        "/v1/auth-interno/default-admin-user"
      );

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
    it("Should generate new admin user", async (done) => {
      await UsuariosInternos.deleteMany();
      const response = await request.post(
        "/v1/auth-interno/default-admin-user"
      );

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

      const adminUser = await UsuariosInternos.findOne({
        role: "admin",
      }).exec();

      expect(adminUser).toBeTruthy();
      expect(adminUser.userName).toBe("adminHrapp");
      expect(adminUser.role).toBe("admin");

      done();
    });
  });
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

      const usuario = await UsuariosInternos.findOne({
        userName: "usuario5",
      }).exec();

      expect(usuario).toBeTruthy();

      await expectAuditLog("/v1/auth-interno/registrar");

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

      const usuario = await UsuariosInternos.findOne({
        userName: "usuario6",
      }).exec();

      expect(usuario).toBeTruthy();

      await expectAuditLog("/v1/auth-interno/registrar");

      done();
    });
  });
  describe("Put /cambiar-contrasenia/:userName", () => {
    it("Should not change user pasword without a token", async (done) => {
      const response = await request.put(
        "/v1/auth-interno/cambiar-contrasenia/usuario"
      );

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
        .put("/v1/auth-interno/cambiar-contrasenia/usuario")
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
    it("Should not change user password if userName name is invalid", async (done) => {
      const postData = {
        password: "encrypted",
      };

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia/u")
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
    it("Should not change user password if password has invalid length", async (done) => {
      const postData = {
        password: "123Asd!",
      };

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia/usuario")
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
        .put("/v1/auth-interno/cambiar-contrasenia/usuario")
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
    it("Should not change user password if user doesnt exists", async (done) => {
      const postData = {
        password: "encrypteD1!",
      };

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia/usuario25")
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
    it("Should change user password", async (done) => {
      const postData = {
        password: "encrypteD1!",
      };

      const usuarioAntes = await UsuariosInternos.findOne({
        userName: "usuario",
      }).exec();

      const response = await request
        .put("/v1/auth-interno/cambiar-contrasenia/usuario")
        .set("Authorization", tokenInterno)
        .send(postData);

      const mensaje = await getMensajes("passwordChanged");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const usuarioDespues = await UsuariosInternos.findOne({
        userName: "usuario",
      }).exec();

      expect(usuarioAntes.password).not.toBe(usuarioDespues.password);

      await expectAuditLog("/v1/auth-interno/cambiar-contrasenia/:userName");

      done();
    });
  });
  describe("Delete /eliminar-usuario/:userName", () => {
    it("Should not delete user without a token", async (done) => {
      const response = await request.delete(
        "/v1/auth-interno/eliminar-usuario/usuario"
      );

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
        .delete("/v1/auth-interno/eliminar-usuario/usuario")
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
    it("Should delete user", async (done) => {
      const response = await request
        .delete("/v1/auth-interno/eliminar-usuario/admin")
        .set("Authorization", tokenInterno);

      const mensaje = await getMensajes("userDeleted");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const usuario = await UsuariosInternos.findOne({
        userName: "admin",
      }).exec();

      expect(usuario.role).toBeFalsy();

      const refreshToken = await RefreshTokenInterno.findOne({
        user_id: usuario._id,
        revoked: null,
      }).exec();

      expect(refreshToken).toBeFalsy();

      await expectAuditLog("/v1/auth-interno/eliminar-usuario/:userName");

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
      const response = await request.post("/v1/auth-interno/refresh-token");

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
