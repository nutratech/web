import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

async function call(dict: AxiosRequestConfig): Promise<AxiosResponse> {
  // Input values
  const method = dict.method?.toUpperCase();
  const { url } = dict;
  const props = Object.keys(dict).slice(2);

  console.debug(`${method} ${url} with ${props}`);

  // Make the request. Return response or throw err
  return axios(dict)
    .then((response: AxiosResponse) => {
      console.debug(`Got response: ${JSON.stringify(response.data)}`);
      return response;
    })
    .catch((err: Error | AxiosError) => {
      // Check if it's of type AxiosError
      if (!axios.isAxiosError(err) || !err.response) {
        console.error("ERROR: Not an Axios error! Inside ApiService");
        throw err;
      }

      // Check if we got a connection refused
      if (err.code === "ECONNREFUSED") {
        console.error("ERROR: Server not running? Can't reach API... throwing error!");
        throw err;
      }

      // TODO: better logging, handling of common error codes
      console.debug(`Got HTTP ${err.response.status} ${JSON.stringify(err.response.data)} `);
      throw err;
    });
}

export {
  // eslint-disable-next-line import/prefer-default-export
  call,
};
