export interface ErrorResponse {
  errMsg?: string;
}

// TODO: parse .json() off body into class attribute
// ------------------------------------------------------
// CLASS: ApiResponse
// ------------------------------------------------------
export interface ApiResponse<ResponseType> {
  program: string;
  version: string;
  release: string;
  datetime: string;
  timestamp: bigint | number;
  ok: boolean;
  code: bigint;
  data: ResponseType;
  errMsg: string | undefined;
}

// ------------------------------------------------------
// Helper methods
// ------------------------------------------------------
function buildApiResponse<ResponseType>(
  code: bigint | number,
  data: ResponseType
): ApiResponse<ResponseType> {
  return {
    code,
    data,
  } as ApiResponse<ResponseType>;
}

async function handleFetch<ResponseType>(request: Request): Promise<ApiResponse<ResponseType | ErrorResponse>> {
  // prettier-ignore
  return fetch(request)
    .then(async (response: Response) => {
      console.debug(`Got response: ${JSON.stringify(response)}`);

      // Handle Text (non-JSON) Content-Type
      if (response.headers.get("content-type")?.startsWith("text/")) {
        const errMsg = await response.text();
        return buildApiResponse<ErrorResponse>(response.status, { errMsg });
      }

      // Handle JSON (default behavior)
      // NOTE: will fail on HTML endpoints, or any server besides ntserv
      return (await response.json()) as ApiResponse<ResponseType>;
    })
    // Bundle the error (with message) as a new Response()
    .catch((err: Error) => {
      // TODO: is this proper? 418?
      console.warn("ERROR: General API error. Not connected?");
      return buildApiResponse<ErrorResponse>(418n, { errMsg: err.message });
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
export class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ------------------------------------------------------
  // HTTP class methods
  // ------------------------------------------------------
  public async get<ResponseType>(route: string): Promise<ApiResponse<ResponseType | ErrorResponse>> {
    // TODO: support query params, headers, etc
    const request = requestBuilder(`${this.baseUrl}${route}`, "GET");
    return handleFetch<ResponseType>(request);
  }

  public async post<ResponseType>(
    route: string,
    body: Record<string, unknown> | unknown[]
  ): Promise<ApiResponse<ResponseType | ErrorResponse>> {
    const request = requestBuilder(`${this.baseUrl}${route}`, "POST", body);
    return handleFetch<ResponseType>(request);
  }

  // TODO: PATCH, DELETE, etc
}
