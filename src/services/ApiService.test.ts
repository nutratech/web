import { call } from "./ApiService";

describe("Real HTTP calls", () => {
  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv [JSON res] yields deserializable response",
    async () => {
      const res = await call(new Request(
        "https://dev.nutra.tk/api/pg/version",
        { method: "GET" }
      ));

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: { [key: string]: unknown} };
      expect(Object.keys(result.data)).toContain("versions");
    }
  );

  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv WITH body [JSON res] yields deserializable response [from JSON]",
    async () => {
      const res = await call(
        new Request("https://dev.nutra.tk/api/calc/1rm", {
          method: "POST",
          body: JSON.stringify({
            reps: 12,
            weight: 225,
          }),
        })
      );

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: { [key: string]: unknown} };
      expect(Object.keys(result.data)).toContain("epley");
    }
  );

  // prettier-ignore
  test(
    "Real 401 HTTP call to ntserv [JSON res] yields deserializable response",
    async () => {
      const res = await call(new Request(
        "https://dev.nutra.tk/api/email/change",
        { method: "GET" }
      ));

      expect(res.status).toEqual(401);

      const result = await res.json() as { data: { [key: string]: unknown} };
      expect(Object.keys(result)).toContain("data");
    }
  );

  // prettier-ignore
  test(
    "Real 405 HTTP call to ntserv [TEXT res] yields deserializable response",
    async () => {
      const res = await call(new Request(
        "https://dev.nutra.tk/api/pg/version",
        { method: "POST" }
      ));

      expect(res.status).toEqual(405);

      const result = await res.json() as { data: { [key: string]: unknown} };
      expect(Object.keys(result)).toContain("data");
      expect(Object.keys(result.data)).toContain("err_msg");
      // TODO: resolve TS2339: Property 'err_msg' does not exist on type 'never'.
      //  maybe it needs a special class e.g. ServerJsonResponse(code, Optional[err_msg], ...)
      // TODO: why doesn't "make lint" show this error, but WebStorm does?
      expect(result.data.err_msg).toContain("Method Not Allowed");
    }
  );

  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv [HTML res] yields deserializable response w/ err_msg prop",
    async () => {
      const res = await call(new Request("https://dev.nutra.tk/api/nutrients/html"));

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: { [key: string]: unknown} };
      expect(Object.keys(result)).toContain("data");
      expect(Object.keys(result.data)).toContain("err_msg");
      expect(result.data.err_msg).toBeTruthy();
    }
  );

  jest.setTimeout(15000);
  // prettier-ignore
  test(
    "Real ECONNREFUSED call [ERROR res] to unreachable website yields err_msg prop",
    async () => {
      const res = await call(new Request("https://googlewoudlx34.wooweowodl"));

      const result = await res.json() as { data: { [key: string]: unknown} };
      expect(Object.keys(result.data)).toContain("err_msg");
    }
  );
});
