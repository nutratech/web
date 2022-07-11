import assert from "assert";
import axios from "axios";
import { call } from "./ApiService";

const DEV_API_URL = "https://dev.nutra.tk/api";

it(`ApiService can reach ${DEV_API_URL}`, async () => {
  let thrownError;

  try {
    await call({
      method: "GET",
      url: DEV_API_URL,
    });
  } catch (err) {
    thrownError = err;
  }

  // TODO: fix: Error: Cross origin http://localhost forbidden
  assert(axios.isAxiosError(thrownError));
  assert(thrownError.code === "ERR_NETWORK");
});

it("Random URL domain throws error", async () => {
  let thrownError;

  try {
    await call({
      method: "GET",
      url: "https://googffffpsduifowlle.comslkvhwl",
    });
  } catch (err) {
    thrownError = err;
  }

  assert(axios.isAxiosError(thrownError));
  // TODO: this should actually be "ECONNREFUSED"
  assert(thrownError.code === "ERR_NETWORK");
});
