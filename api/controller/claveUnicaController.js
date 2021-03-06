const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getMensajes } = require("../config");

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;

const secretClaveUnica = process.env.JWT_SECRET_CLAVE_UNICA;

const expiresIn = 60 * 15 * 1 * 1; // seconds, minutes, hours, days

exports.datosCliente = async (req, res) => {
  try {
    const state = signToken(
      { tokenClaveUnica: "TokenClaveUnica" },
      expiresIn,
      secretClaveUnica
    );
    res.status(200).send({
      clientId,
      state,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.toapp = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    const decodedStateToken = await decodeToken(state, secretClaveUnica);

    if (!decodedStateToken)
      return res
        .status(401)
        .send({ respuesta: await getMensajes("unauthorized") });

    const { access_token } = await requestTokenClaveUnica(code, state);

    const infoUsuario = await requestInfoUsuarioClaveUnica(access_token);

    const { RolUnico, name } = infoUsuario;

    const { numero, DV } = RolUnico;

    const rut = `${numero}-${DV}`;

    req.body = {
      nombreCompleto: name,
      rut,
    };

    // await cerrarSesionClaveUnica(access_token);

    next();
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

const requestTokenClaveUnica = async (code, state) => {
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectURI);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("state", state);

  const response = await axios.post(
    "https://accounts.claveunica.gob.cl/openid/token/",
    params,
    config
  );
  return response.data;
};

const requestInfoUsuarioClaveUnica = async (access_token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  const response = await axios.post(
    "https://accounts.claveunica.gob.cl/openid/userinfo",
    {},
    config
  );

  return response.data;
};

const cerrarSesionClaveUnica = async (access_token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  const response = await axios.get(
    "https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout",
    {},
    config
  );
};

const signToken = (content, expiresIn, secret) => {
  return jwt.sign(content, secret, { expiresIn });
};

const decodeToken = async (token, secret) => {
  const result = await new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return resolve(false);
      return resolve(decoded);
    });
  });
  return result;
};
