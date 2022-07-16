import type BodyFatForm from "../../models/BodyFatForm";
import type BodyFatResponse from "../../models/BodyFatResponse";
import { call } from "../ApiService";

export default class CalculatorService {
  static async calculateBodyFatPercentage(bodyFatForm: BodyFatForm): Promise<BodyFatResponse> {
    const resp = await call(
      new Request("https://dev.nutra.tk/api/calc/body-fat", {
        method: "POST",
        body: JSON.stringify(bodyFatForm),
      })
    );
    const data = (await resp.json()) as Record<string, never>;
    return data as BodyFatResponse; // just for testing purposes
  }
}
