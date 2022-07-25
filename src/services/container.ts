/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * Temporary holder of DI instances, will move over to real DI library eventually
 */

import CalculatorService from "./calculator/CalculatorService";

export default class DependencyContainer {
  public static readonly calculatorService = new CalculatorService();
}
