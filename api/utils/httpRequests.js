const axios = require("axios");

const conectionError = {
  name: "Conection error",
  message: "Axios request failed",
};

const httpRequestError = (status, data) => {
  let message = data;
  if (typeof data === "object") {
    message = "";
    for (let key in data) {
      message = `${message} - ${key}: ${data[key]}`
    }
  }
  return {
    name: "Http request error",
    message: `status: ${status} ${message}`,
  };
};

const httpRequest = async (method, url, params, config, cantIntentos) => {
  if (method === "GET") {
    return await axios.get(url, config).catch(async (error) => {
      if (cantIntentos < 1) {
        if (!error?.response) return conectionError;
        return httpRequestError(error.response.status, error.response.data);
      }
      return await httpRequest(method, url, params, config, cantIntentos - 1);
    });
  }

  if (["POST", "PUT", "DELETE"].includes(method)) {
    return await axios.post(url, params, config).catch(async (error) => {
      if (cantIntentos < 1) {
        if (!error?.response) return conectionError;
        return httpRequestError(error.response.status, error.response.data);
      }
      return await httpRequest(method, url, params, config, cantIntentos - 1);
    });
  }
};

module.exports = { httpRequest };
