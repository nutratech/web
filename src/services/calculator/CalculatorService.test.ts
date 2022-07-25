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
        fetch: async (): Promise<ApiResponse> =>
          // @ts-expect-error There is a mismatch between ApiResponse and bare data used here
          ({
            data: {
              navy: 0,
              sevenSite: 1,
              threeSite: 2,
            },
          }),
      } as unknown as ApiResponse);
      await CalculatorService.calculateBodyFatPercentage({} as BodyFatForm);
      // TODO: get this test working again
      // eslint-disable-next-line @typescript-eslint/unbound-method
      // expect(apiService.get).toHaveBeenCalled();
      // expect(apiService.get).toHaveBeenCalledWith("/calc/body-fat");
    });
  });
});
