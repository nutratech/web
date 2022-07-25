import { Gender } from "../../constants/calculator-constants";
import type BodyFatForm from "../../models/BodyFatForm";
import type { BodyFatResults } from "../../store/calculator";

export default class CalculatorService {
  public calculateBodyFatPercentage(bodyFatForm: BodyFatForm): BodyFatResults {
    return {
      navy: this.calculateNavyBodyFatPercentage(bodyFatForm),
      sevenSite: this.calculateSevenSiteBodyFatPercentage(bodyFatForm),
      threeSite: this.calculateThreeSiteBodyFatPercentage(bodyFatForm),
    };
  }

  public calculateNavyBodyFatPercentage({ gender, waist, neck, hip, height }: BodyFatForm): number {
    const denominator
      = gender === Gender.Male
        ? 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)
        : 1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height);
    return Number((495 / denominator - 450).toFixed(2));
  }

  public calculateThreeSiteBodyFatPercentage({
    gender,
    chest,
    abd,
    thigh,
    age,
  }: BodyFatForm): number {
    const st3 = chest + abd + thigh;

    const denominator
      = gender === Gender.Male
        ? 1.10938 - 0.0008267 * st3 + 0.0000016 * st3 * st3 - 0.0002574 * age
        : 1.089733 - 0.0009245 * st3 + 0.0000025 * st3 * st3 - 0.0000979 * age;
    return Number((495 / denominator - 450).toFixed(2));
  }

  public calculateSevenSiteBodyFatPercentage({
    gender,
    chest,
    abd,
    thigh,
    age,
    tricep,
    sub,
    sup,
    mid,
  }: BodyFatForm): number {
    const st7 = chest + abd + thigh + tricep + sub + sup + mid;

    const denominator
      = gender === Gender.Male
        ? 1.112 - 0.00043499 * st7 + 0.00000055 * st7 * st7 - 0.00028826 * age
        : 1.097 - 0.00046971 * st7 + 0.00000056 * st7 * st7 - 0.00012828 * age;

    return Number((495 / denominator - 450).toFixed(2));
  }
}
