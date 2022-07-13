// eslint-disable-next-line import/prefer-default-export
export async function call(dict: Request): Promise<Response> {
  // prettier-ignore
  return fetch(dict)
    .then(async (response: Response) => {
      console.debug(`Got response: ${JSON.stringify(response)}`);

      // Handle Text (non-JSON) Content-Type
      if (response.headers.get("content-type")?.startsWith("text/")) {
        const bodyText = await response.text();
        return new Response(JSON.stringify({
          code: response.status,
          data: { err_msg: bodyText },
        }), {
          status: response.status, statusText: bodyText,
        });
      }

      // return default
      return response;
    })
    // Bundle the error (with message) as a new Response()
    .catch((err) => {
      console.warn("ERROR: General API error. Not connected?");
      return new Response(JSON.stringify({ code: 418, data: { err_msg: err.message } }), {
        status: 418, statusText: err.message,
      });
    });
}
