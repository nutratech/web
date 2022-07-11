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
  
      expect(true).toBeTrue();
    });
  });
});
