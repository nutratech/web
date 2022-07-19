import ApiService from "./ApiService";

describe("Real HTTP calls", () => {
  const apiService = new ApiService("https://dev.nutra.tk/api");
  const bogusApiService = new ApiService("https://googlewoudlx34.wooweowodl");

  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv [JSON res] yields deserializable response",
    async () => {
      const res = await apiService.get("/pg/version");

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result.data)).toContain("versions");
    }
  );

  // TODO: test with post body as unknown[] not as Record<string, unknown>, e.g. body: [1, 2, 3]
  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv WITH body [JSON res] yields deserializable response [from JSON]",
    async () => {
      const res = await apiService.post(
        "/calc/1rm",
        {
          reps: 12,
          weight: 225,
        }
      );

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result.data)).toContain("epley");
    }
  );

  // prettier-ignore
  test(
    "Real 401 HTTP call to ntserv [JSON res] yields deserializable response",
    async () => {
      const res = await apiService.get("/email/change");

      expect(res.status).toEqual(401);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result)).toContain("data");
    }
  );

  // prettier-ignore
  test(
    "Real 405 HTTP call to ntserv [TEXT res] yields deserializable response",
    async () => {
      const res = await apiService.post("/pg/version", {});

      expect(res.status).toEqual(405);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result)).toContain("data");
      expect(Object.keys(result.data)).toContain("errMsg");
      // TODO: resolve TS2339: Property 'errMsg' does not exist on type 'never'.
      //  maybe it needs a special class e.g. ServerJsonResponse(code, Optional[errMsg], ...)
      // TODO: why doesn't "make lint" show this error, but WebStorm does?
      expect(result.data.errMsg).toContain("Method Not Allowed");
    }
  );

  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv [HTML res] yields deserializable response w/ errMsg prop",
    async () => {
      const res = await apiService.get("/nutrients/html");

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result)).toContain("data");
      expect(Object.keys(result.data)).toContain("errMsg");
      expect(result.data.errMsg).toBeTruthy();
    }
  );

  jest.setTimeout(15000);
  // prettier-ignore
  test(
    "Real ECONNREFUSED call [ERROR res] to unreachable website yields errMsg prop",
    async () => {
      const res = await bogusApiService.get("/");

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result.data)).toContain("errMsg");
    }
  );
});
