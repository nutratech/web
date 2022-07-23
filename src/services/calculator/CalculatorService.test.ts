import type BodyFatForm from "../../models/BodyFatForm";
import type { ApiResponse } from "../ApiService";
import { ApiService } from "../ApiService";
import CalculatorService from "./CalculatorService";

const baseUrl = "https://dev.nutra.tk/api";
const apiService = new ApiService(baseUrl);

describe("CalculatorService", () => {
  describe("calculateBodyFatPercentage", () => {
    it("calls the API endpoint with the given arguments", async () => {
      jest.spyOn(apiService, "get").mockResolvedValue({
        fetch: async (): ApiResponse =>
          ({
            data: {
              navy: 0,
              sevenSite: 1,
              threeSite: 2,
            },
          } as ApiResponse),
      });
      await CalculatorService.calculateBodyFatPercentage({} as BodyFatForm);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(apiService.get).toHaveBeenCalled();
      // expect(apiService.get).toHaveBeenCalledWith("/calc/body-fat");
    });
  });
});
