import * as calculatorConstants from "../../../constants/calculator-constants";

const getAllRequiredFieldsFromSelectedTests = (selectedTestTypes: {
  [key in calculatorConstants.BodyFatTestKeyType]: boolean;
}): calculatorConstants.BodyFatFieldName[] =>
  Object.keys(selectedTestTypes).reduce<calculatorConstants.BodyFatFieldName[]>(
    (required, testType) => [
      ...required,
      ...(selectedTestTypes[testType as calculatorConstants.BodyFatTestKeyType]
        ? calculatorConstants.RequiredFields[testType as calculatorConstants.BodyFatTestKeyType]
        : []),
    ],
    []
  );

export default {
  getAllRequiredFieldsFromSelectedTests,
};
