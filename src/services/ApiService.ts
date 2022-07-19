async function handleFetch(request: Request): Promise<Response> {
  // prettier-ignore
  return fetch(request)
    .then(async (response: Response) => {
      console.debug(`Got response: ${JSON.stringify(response)}`);

      // Handle Text (non-JSON) Content-Type
      if (response.headers.get("content-type")?.startsWith("text/")) {
        const bodyText = await response.text();
        return new Response(JSON.stringify({
          code: response.status,
          data: { errMsg: bodyText },
        }), {
          status: response.status, statusText: bodyText,
        });
      }
      // TODO: try to parse the .json() or .text()

      // return default
      return response;
    })
    // Bundle the error (with message) as a new Response()
    .catch((err: Error) => {
      // TODO: is this proper? 418?
      console.warn("ERROR: General API error. Not connected?");
      return new Response(JSON.stringify({ code: 418, data: { errMsg: err.message } }), {
        status: 418, statusText: err.message,
      });
    });
}

function requestBuilder(route: string, method: string, body: Record<string, unknown> | unknown[]): Request {
  return new Request(`${this.baseUrl}${route}`, {
    method,
    body: JSON.stringify(body),
  });
}

export default class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async post(route: string, body: Record<string, unknown> | unknown[]): Promise<Response> {
    const request = requestBuilder();
    //   new Request(`${this.baseUrl}${route}`, {
    //   method: "POST",
    //   body: JSON.stringify(body),
    // });

    return handleFetch(request);
  }
}
