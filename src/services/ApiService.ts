import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from "axios";

export default class ApiService {
  constructor(private axios: AxiosInstance){

  }

  async call<ReturnType>(dict: AxiosRequestConfig): Promise<AxiosResponse | null> {
    const method = dict.method?.toUpperCase();
    const { url } = dict;
    const props = Object.keys(dict).slice(2);

    if(!url){
      return null;
    }
  
    console.debug(`${method} ${url} with ${props}`);
  
    return this.axios.request(dict)
      .then((response: AxiosResponse<ReturnType, unknown>) => {
        console.debug(`Got response: ${JSON.stringify(response.data)}`);
        return response;
      })
      .catch((err: Error | AxiosError) => {
        if(!axios.isAxiosError(err) || !err.response){
          throw err;
        }
        if (err.code === "ECONNREFUSED") {
          console.error("ERROR: Server not running? Can't reach API... exiting!");
          throw err;
        }
        // TODO: better logging, handling of common error codes
        console.debug(`Got HTTP ${err.response.status} ${JSON.stringify(err.response.data)} `);
        return err.response;
      });
  }
};
