import { call } from "./ApiService";

describe("Real HTTP calls", () => {
  test("Real 200 HTTP call to ntserv yields deserializable response [from JSON]", async () => {
    const res = await call(new Request("https://dev.nutra.tk/api/pg/version", { method: "GET" }));

    const result = await res.json();
    expect(result.code).toEqual(200);
    expect(Object.keys(result.data)).toContain("versions");
  });

  test("Real 200 HTTP call to ntserv WITH body yields deserializable response [from JSON]", async () => {
    const res = await call(
      new Request("https://dev.nutra.tk/api/calc/1rm", {
        method: "POST",
        body: JSON.stringify({
          reps: 12,
          weight: 225,
        }),
      })
    );

    const result = await res.json();
    expect(result.code).toEqual(200);
    expect(Object.keys(result.data)).toContain("epley");
  });

  test("Real 401 HTTP call to ntserv yields deserializable response [from JSON]", async () => {
    const res = await call(new Request("https://dev.nutra.tk/api/email/change", { method: "GET" }));

    const result = await res.json();
    expect(result.code).toEqual(401);
    expect(Object.keys(result)).toContain("data");
  });

  test("Real 405 HTTP call to ntserv yields deserializable response [from HTML]", async () => {
    const res = await call(new Request("https://dev.nutra.tk/api/pg/version", { method: "POST" }));

    const result = await res.json();
    expect(result.code).toEqual(405);
    expect(Object.keys(result)).toContain("data");
    expect(Object.keys(result.data)).toContain("err_msg");
    expect(result.data.err_msg).toContain("Method Not Allowed");
  });

  test("Real ECONNREFUSED call to unreachable website yields err_msg prop [from Error]", async () => {
    const res = await call(new Request("https://googlewoudlx34.wooweowodl", { method: "GET" }));

    const result = await res.json();
    expect(Object.keys(result.data)).toContain("err_msg");
  });
});
