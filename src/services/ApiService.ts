// TODO: parse .json() off body into class attribute
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

function requestBuilder(
  url: string,
  method: string,
  body: Record<string, unknown> | unknown[] | undefined = undefined
): Request {
  if (body) {
    return new Request(url, {
      method,
      body: JSON.stringify(body),
    });
  }
  // TODO: support query params, headers, etc
  return new Request(url);
}

// ------------------------------------------------------
// CLASS: ApiService
// ------------------------------------------------------
export default class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ------------------------------------------------------
  // HTTP methods
  // ------------------------------------------------------
  public async get(route: string): Promise<Response> {
    // TODO: support query params, headers, etc
    const request = requestBuilder(`${this.baseUrl}${route}`, "GET");
    return handleFetch(request);
  }

  public async post(route: string, body: Record<string, unknown> | unknown[]): Promise<Response> {
    const request = requestBuilder(`${this.baseUrl}${route}`, "POST", body);
    return handleFetch(request);
  }

  // TODO: PATCH, DELETE, etc
}
