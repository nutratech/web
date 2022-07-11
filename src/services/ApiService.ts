import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

async function call(dict: AxiosRequestConfig): Promise<AxiosResponse> {
  const method = dict.method?.toUpperCase();
  const { url } = dict;
  const props = Object.keys(dict).slice(2);

  console.debug(`${method} ${url} with ${props}`);

  return axios(dict)
    .then((response) => {
      console.debug(`Got response: ${JSON.stringify(response.data)}`);
      return response;
    })
    .catch((err) => {
      if (err.code === "ECONNREFUSED") {
        console.error("ERROR: Server not running? Can't reach API... exiting!");
        throw err;
      }
      // TODO: better logging, handling of common error codes
      console.debug(`Got HTTP ${err.response.status} ${JSON.stringify(err.response.data)} `);
      return err.response;
    });
}

export default {
  call,
};
