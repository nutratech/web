import type BodyFatForm from "../../models/BodyFatForm";
import type BodyFatResponse from "../../models/BodyFatResponse";
import ApiService from "../ApiService";

const calculateBodyFatPercentage = async (bodyFatForm: BodyFatForm): Promise<BodyFatResponse> => {
  const resp = await ApiService.call(
    new Request("https://dev.nutra.tk/api/calc/body-fat", {
      method: "POST",
      body: JSON.stringify(bodyFatForm),
    })
  );
  const data = (await resp.json()) as Record<string, unknown>;
  return data as unknown as BodyFatResponse; // just for testing purposes
};

export default {
  calculateBodyFatPercentage,
};
