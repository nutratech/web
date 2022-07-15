import HeaderService from "./HeaderService";

describe("HeaderService", () => {
  describe("navigateRouter", () => {
    it("calls navigate with the given path", () => {
      const navigate = jest.fn();
      HeaderService.navigateRouter(navigate, "abc");
      expect(navigate).toHaveBeenCalledWith({ pathname: "abc" });
    });
  });
});
