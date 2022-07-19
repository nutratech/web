import ApiService from "./ApiService";

describe("Real HTTP calls", () => {
  const apiService = new ApiService("https://dev.nutra.tk/api");
  const bogusApiService = new ApiService("https://googlewoudlx34.wooweowodl");

  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv [JSON res] yields deserializable response",
    async () => {
      const res = await apiService.call(new Request(
        `${apiService.baseUrl}/pg/version`,
        { method: "GET" }
      ));

      expect(res.status).toEqual(200);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result.data)).toContain("versions");
    }
  );

  // prettier-ignore
  test(
    "Real 200 HTTP call to ntserv WITH body [JSON res] yields deserializable response [from JSON]",
    async () => {
      const res = await apiService.call(
        new Request(`${apiService.baseUrl}/calc/1rm`, {
          method: "POST",
          body: JSON.stringify({
            reps: 12,
            weight: 225,
          }),
        })
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
      const res = await apiService.call(new Request(
        `${apiService.baseUrl}/email/change`,
        { method: "GET" }
      ));

      expect(res.status).toEqual(401);

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result)).toContain("data");
    }
  );

  // prettier-ignore
  test(
    "Real 405 HTTP call to ntserv [TEXT res] yields deserializable response",
    async () => {
      const res = await apiService.call(new Request(
        `${apiService.baseUrl}/pg/version`,
        { method: "POST" }
      ));

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
      const res = await apiService.call(new Request(`${apiService.baseUrl}/nutrients/html`));

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
      const res = await bogusApiService.call(new Request(bogusApiService.baseUrl));

      const result = await res.json() as { data: Record<string, unknown> };
      expect(Object.keys(result.data)).toContain("errMsg");
    }
  );
});
