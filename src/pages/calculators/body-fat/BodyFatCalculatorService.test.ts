import BodyFatCalculatorService from "./BodyFatCalculatorService";

describe("BodyFatCalculatorService", () => {
  describe("getAllRequiredFieldsFromSelectedTests", () => {
    // eslint-disable-next-line max-len
    it("gets a list of the required fields based on the tests selected (may include duplicates)", () => {
      const results = BodyFatCalculatorService.getAllRequiredFieldsFromSelectedTests({
        navy: true,
        sevenSite: false,
        threeSite: true,
      });
      expect(results).toEqual(
        ["gender", "neck", "waist", "hip", "height", "gender", "age", "abd", "chest", "thigh"]
      );
    });
  });
});
