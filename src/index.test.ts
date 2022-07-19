import ReactDOM from "react-dom/client";
import init from "./index";

describe("index", () => {
  it("logs an error if the root element doesn't exist", async () => {
    jest.spyOn(document, "getElementById").mockReturnValue(null);
    jest.spyOn(console, "error");
    init();
    expect(console.error).toHaveBeenCalledWith(
      "Failed to attach to root element, could not find the element"
    );
  });

  it("renders the app into the root if the root element does exist", async () => {
    const el = document.createElement("div");
    jest.spyOn(document, "getElementById").mockReturnValue(el);
    jest.spyOn(console, "error");
    const mockRoot = {
      render: (): void => {},
    } as unknown as ReactDOM.Root;
    jest.spyOn(mockRoot, "render");
    jest.spyOn(ReactDOM, "createRoot").mockReturnValue(mockRoot);
    init();
    expect(console.error).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRoot.render).toHaveBeenCalled();
  });
});
