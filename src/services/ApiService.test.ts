import assert from "assert";
import ApiService from "./ApiService";

describe('ApiService', () => {
  let service: ApiService;
  beforeEach(() => {
    service = new ApiService();
  });

  it("ApiService can reach google.com", async () => {
    const result = await service.call({
      method: "GET",
      url: "https://googffffle.com",
    });
  
    console.debug(result);
  });
});
