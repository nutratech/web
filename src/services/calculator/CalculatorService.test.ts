import type BodyFatForm from "../../models/BodyFatForm";
import type BodyFatResponse from "../../models/BodyFatResponse";
import ApiService from "../ApiService";
import CalculatorService from "./CalculatorService";

const baseUrl = "https://dev.nutra.tk/api";
const apiService = new ApiService(baseUrl);

describe("CalculatorService", () => {
  describe("calculateBodyFatPercentage", () => {
    it("calls the API endpoint with the given arguments", async () => {
      jest.spyOn(apiService, "get").mockResolvedValue({
        json: async (): ApiService.ApiResponse =>
        return {
          data:{
            navy: 0,
            sevenSite: 1,
            threeSite: 2,
          }
        } as ApiService.ApiResponse
      } );
      await CalculatorService.calculateBodyFatPercentage({} as BodyFatForm);
      expect(apiService.get).toHaveBeenCalledWith(
        new Request(`${baseUrl}/calc/body-fat`, {
          method: "POST",
          body: JSON.stringify({} as BodyFatForm),
        })
      );
    });
  });
});
