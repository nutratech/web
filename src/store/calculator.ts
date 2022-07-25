import create from "zustand";
import type { BodyFatTestType } from "../constants/calculator-constants";
import type BodyFatForm from "../models/BodyFatForm";
import DependencyContainer from "../services/container";

export interface BodyFatResults {
  [BodyFatTestType.navy]: number;
  [BodyFatTestType.threeSite]: number;
  [BodyFatTestType.sevenSite]: number;
}

export interface CalculatorState {
  bodyFatResults: BodyFatResults;
}

export type CalculateBodyFatFunction = (form: BodyFatForm) => void;

export interface CalculatorActions {
  calculateBodyFat: CalculateBodyFatFunction;
}

export interface CalculatorStore extends CalculatorState, CalculatorActions {

}

const useStore = create<CalculatorStore>((set) => ({
  bodyFatResults: {
    navy: 0,
    sevenSite: 0,
    threeSite: 0,
  },
  calculateBodyFat: (form: BodyFatForm): void => {
    const bodyFatResults = DependencyContainer.calculatorService.calculateBodyFatPercentage(form);
    set({
      bodyFatResults,
    });
  },
}));

// selectors
export const selectBodyFatResults
  = (state: CalculatorState): BodyFatResults => state.bodyFatResults;

// actions
export const selectCalculateBodyFat
  = (state: CalculatorActions): CalculateBodyFatFunction => state.calculateBodyFat;

export default useStore;
