import HomeService from "./Home.service";

describe("HomeService", () => {
  describe("viewCalculators", () => {
    it("navigates to the body fat calculator", () => {
      const navigate = jest.fn();
      HomeService.viewCalculators(navigate);
      expect(navigate).toHaveBeenCalledWith("/calculators/body-fat");
    });
  });
});
