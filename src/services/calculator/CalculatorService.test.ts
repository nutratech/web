import type BodyFatForm from "../../models/BodyFatForm";
import type BodyFatResponse from "../../models/BodyFatResponse";
import ApiService from "../ApiService";
import CalculatorService from "./CalculatorService";

describe("CalculatorService", () => {
  describe("calculateBodyFatPercentage", () => {
    it("calls the API endpoint with the given arguments", async () => {
      jest.spyOn(ApiService, "call").mockResolvedValue({
        json: async (): Promise<BodyFatResponse> =>
          ({
            navy: 0,
            sevenSite: 1,
            threeSite: 2,
          } as BodyFatResponse),
      } as Response);
      await CalculatorService.calculateBodyFatPercentage({} as BodyFatForm);
      expect(ApiService.call).toHaveBeenCalledWith(
        new Request("https://dev.nutra.tk/api/calc/body-fat", {
          method: "POST",
          body: JSON.stringify({} as BodyFatForm),
        })
      );
    });
  });
});
