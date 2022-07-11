export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export default class ApiService {
  private fetch: FetchFunction;

  constructor(private window: Window) {
    this.fetch = this.window.fetch;
  }

  async call<BodyType>(url: string, method: string, body?: BodyType): Promise<BodyType | null> {
    return this.fetch(url, {
      method,
      body: body ? JSON.stringify(body) : null,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response: Response) => {
        if(response.ok){
          try {
            return response.json();
          } catch {
            return {};
          }
        }
        throw new Error('Response was not 200 OK');
      })
      .then((data: unknown) => {
        return data as BodyType;
      })
      .catch((err: Error) => {
        console.error("Error in API service", {
          ...err,
        });
        throw err;
      });
  }
};
