import type BodyFatForm from "../../models/BodyFatForm";
import type BodyFatResponse from "../../models/BodyFatResponse";
import { ApiService } from "../ApiService";

const apiService = new ApiService("https://dev.nutra.tk/api");

const calculateBodyFatPercentage = async (bodyFatForm: BodyFatForm): Promise<BodyFatResponse> => {
  const response = await apiService.post("/calc/body-fat", bodyFatForm);
  return response.data as unknown as BodyFatResponse;
};

export default {
  calculateBodyFatPercentage,
};
