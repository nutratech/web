export default class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async call(request: Request): Promise<Response> {
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
}
