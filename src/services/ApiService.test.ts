import ApiService, { FetchFunction } from "./ApiService";

describe("ApiService", () => {
  describe("unit tests", () => {
    let service: ApiService;
    let mockWindow: Window;
    beforeEach(() => {
      mockWindow = {
        fetch: async () => ({} as Response),
      } as unknown as Window;

      jest.spyOn(mockWindow, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      service = new ApiService(mockWindow);
    });

    it("calls fetch with the options given", async () => {
      await service.call("https://googffffle.com", "GET");
      expect(mockWindow.fetch).toHaveBeenCalledWith("https://googffffle.com", {
        body: null,
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
    });
  });

  describe("functional tests", () => {
    let service: ApiService;
    beforeEach(() => {
      service = new ApiService(window);
    });

    it("can reach google.com", async () => {
      let thrownError: Error | null = null;

      try {
        await service.call("https://google.com", "GET");
      } catch (err) {
        thrownError = err as Error;
      }

      expect(thrownError?.name).toEqual("TypeError");
    });

    const DEV_API_URL = "https://dev.nutra.tk/api";

    it(`ApiService can reach ${DEV_API_URL}`, async () => {
      let thrownError: Error | null = null;

      try {
        await service.call(DEV_API_URL, "GET");
      } catch (err) {
        thrownError = err as Error;
      }

      expect(thrownError?.name).toEqual("TypeError");
    });

    it("Random URL domain throws error", async () => {
      let thrownError: Error | null = null;

      try {
        await service.call("https://googffffpsduifowlle.comslkvhwl", "GET");
      } catch (err) {
        thrownError = err as Error;
      }

      expect(thrownError?.name).toEqual("TypeError");
    });
  });
});
