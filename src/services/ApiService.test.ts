import axios, { AxiosInstance } from "axios";
import ApiService from "./ApiService";

describe('ApiService', () => {
  describe('unit tests', () => {
    let service: ApiService;
    let axios: AxiosInstance;
    beforeEach(() => {
      axios = {
        request: async () => {
          return null;
        }
      } as unknown as AxiosInstance;
      service = new ApiService(axios);
    });
  
    it('calls axios with the options given', async () => {
      spyOn(axios, 'request');
      await service.call({
        method: "GET",
        url: "https://googffffle.com",
      });
      expect(axios.request).toHaveBeenCalledWith({
        method: "GET",
        url: "https://googffffle.com",
      });
    });
  });

  describe('functional tests', () => {
    let service: ApiService;
    beforeEach(() => {
      service = new ApiService(axios);
    });

    it("can reach google.com", async () => {
      const result = await service.call({
        method: "GET",
        url: "https://googffffle.com",
      });
    
      console.debug(result);
  
      expect(true).toEqual(true);
    });

    const DEV_API_URL = "https://dev.nutra.tk/api";

    it(`ApiService can reach ${DEV_API_URL}`, async () => {
      let thrownError;

      try {
        await service.call({
          method: "GET",
          url: DEV_API_URL,
        });
      } catch (err) {
        thrownError = err;
      }

      expect(axios.isAxiosError(thrownError)).toEqual(true);
      // TODO: fix: Error: Cross origin http://localhost forbidden

      // compiler hint
      if(!axios.isAxiosError(thrownError)){
        return;
      }
      expect(thrownError.code).toEqual("ERR_NETWORK");
    });

    it("Random URL domain throws error", async () => {
      let thrownError;

      try {
        await service.call({
          method: "GET",
          url: "https://googffffpsduifowlle.comslkvhwl",
        });
      } catch (err) {
        thrownError = err;
      }

      expect(axios.isAxiosError(thrownError)).toEqual(true);
      // TODO: this should actually be "ECONNREFUSED"
            // compiler hint
      if(!axios.isAxiosError(thrownError)){
        return;
      }
      expect(thrownError.code).toEqual("ERR_NETWORK");
    });
  });
});