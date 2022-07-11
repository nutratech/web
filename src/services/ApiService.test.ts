import assert from "assert";
import { call } from "./ApiService";

it("ApiService can reach google.com", async () => {
  const result = await call({
    method: "GET",
    url: "https://googffffle.com",
  });

  console.debug(result);
});
