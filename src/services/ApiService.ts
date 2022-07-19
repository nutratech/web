// TODO: parse .json() off body into class attribute
// ------------------------------------------------------
// CLASS: ApiResponse
// ------------------------------------------------------
interface ApiResponse {
  program: string;
  version: string;
  release: string;
  datetime: string;
  timestamp: bigint | number;
  ok: boolean;
  code: bigint;
  data: Record<string, unknown> | unknown[];
  errMsg: string | undefined;
}

// ------------------------------------------------------
// Helper methods
// ------------------------------------------------------
function buildApiResponse(
  code: bigint | number,
  data: Record<string, unknown> | unknown[]
): ApiResponse {
  return {
    code,
    data,
  } as ApiResponse;
}

async function handleFetch(request: Request): Promise<ApiResponse> {
  // prettier-ignore
  return fetch(request)
    .then(async (response: Response) => {
      console.debug(`Got response: ${JSON.stringify(response)}`);

      // Handle Text (non-JSON) Content-Type
      if (response.headers.get("content-type")?.startsWith("text/")) {
        const errMsg = await response.text();
        return buildApiResponse(response.status, { errMsg });
      }

      // Handle JSON (default behavior)
      // NOTE: will fail on HTML endpoints, or any server besides ntserv
      return (await response.json()) as ApiResponse;
    })
    // Bundle the error (with message) as a new Response()
    .catch((err: Error) => {
      // TODO: is this proper? 418?
      console.warn("ERROR: General API error. Not connected?");
      return buildApiResponse(418n, { errMsg: err.message });
      // return new Response(JSON.stringify({ code: 418, data: { errMsg: err.message } }), {
      //   status: 418, statusText: err.message,
      // });
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
  // HTTP class methods
  // ------------------------------------------------------
  public async get(route: string): Promise<ApiResponse> {
    // TODO: support query params, headers, etc
    const request = requestBuilder(`${this.baseUrl}${route}`, "GET");
    return handleFetch(request);
  }

  public async post(
    route: string,
    body: Record<string, unknown> | unknown[]
  ): Promise<ApiResponse> {
    const request = requestBuilder(`${this.baseUrl}${route}`, "POST", body);
    return handleFetch(request);
  }

  // TODO: PATCH, DELETE, etc
}
