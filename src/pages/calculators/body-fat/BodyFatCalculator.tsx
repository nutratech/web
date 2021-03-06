import type { ChangeEvent } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import * as calculatorConstants from "../../../constants/calculator-constants";
import useDebounce from "../../../hooks/debounce";
import type BodyFatForm from "../../../models/BodyFatForm";
import BodyFatCalculatorService from "./BodyFatCalculatorService";
import useStore, { selectBodyFatResults, selectCalculateBodyFat } from "../../../store/calculator";

function BodyFatCalculator(): JSX.Element {
  const [bodyFatForm, setBodyFatForm] = useState({} as BodyFatForm);
  const bodyFatData = useStore(selectBodyFatResults);
  const calculateBodyFat = useStore(selectCalculateBodyFat);

  const debouncedFormData = useDebounce(bodyFatForm, 500);

  const [selectedTestTypes, setSelectedTestTypes] = useState({
    navy: true,
    sevenSite: true,
    threeSite: true,
  } as {
    [key in calculatorConstants.BodyFatTestKeyType]: boolean;
  });

  useEffect(() => {
    calculateBodyFat(debouncedFormData);
  }, [debouncedFormData, calculateBodyFat]);

  const requiredFields: calculatorConstants.BodyFatFieldName[] = useMemo(
    () => BodyFatCalculatorService.getAllRequiredFieldsFromSelectedTests(selectedTestTypes),
    [selectedTestTypes]
  );

  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>): void => {
    formEvent.preventDefault();
  };

  const onTestTypeSelected = (type: calculatorConstants.BodyFatTestKeyType): void => {
    setSelectedTestTypes({
      ...selectedTestTypes,
      [type]: !selectedTestTypes[type],
    });
  };

  const onInputChange = (
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    setBodyFatForm({
      ...bodyFatForm,
      [evt.target.name]:
        evt.target.type === "number" ? Number(evt.target.value) : String(evt.target.value),
    });
  };

  return (
    <Row>
      <Col lg="12">
        <section id="body-fat-calculator">
          <pre>
            Result:
            {JSON.stringify(bodyFatData, null, 2)}
          </pre>
          <Row>
            <Col lg="12">
              <Form
                onSubmit={(evt): void => {
                  handleSubmit(evt);
                }}
              >
                <Row>
                  <Col lg="12">
                    <Form.Group>
                      <Form.Label>Calculations</Form.Label>
                      {calculatorConstants.BodyFatTestTypes.map((testType) => (
                        <Form.Check
                          key={testType}
                          type="checkbox"
                          id={`test-type-${testType}`}
                          name="test-types"
                          label={calculatorConstants.BodyFatTestNames[testType]}
                          checked={selectedTestTypes[testType]}
                          onChange={onTestTypeSelected.bind(null, testType)}
                        />
                      ))}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  {calculatorConstants.BodyFatFieldNames.filter(
                    (fieldName) =>
                      // prettier-ignore
                      calculatorConstants.BodyFatFieldOptions[fieldName].length > 0
                      && requiredFields.includes(fieldName)
                  ).map((fieldName) => (
                    <Col lg="6" key={fieldName}>
                      <Form.Group>
                        <Form.Label>{calculatorConstants.BodyFatFieldLabels[fieldName]}</Form.Label>
                        <Form.Select
                          name={fieldName}
                          value={bodyFatForm[fieldName]}
                          placeholder={calculatorConstants.BodyFatFieldLabels[fieldName]}
                          onChange={onInputChange.bind(null)}
                          aria-label={calculatorConstants.BodyFatFieldLabels[fieldName]}
                        >
                          <option>
                            Select {calculatorConstants.BodyFatFieldLabels[fieldName]}
                          </option>
                          {calculatorConstants.BodyFatFieldOptions[fieldName].map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  ))}
                  {calculatorConstants.BodyFatFieldNames.filter(
                    (fieldName) =>
                      // prettier-ignore
                      calculatorConstants.BodyFatFieldOptions[fieldName].length <= 0
                      && requiredFields.includes(fieldName)
                  ).map((fieldName) => (
                    <Col lg="6" key={fieldName}>
                      <Form.Group>
                        <Form.Label>{calculatorConstants.BodyFatFieldLabels[fieldName]}</Form.Label>
                        <Form.Control
                          type={calculatorConstants.BodyFatFieldTypes[fieldName]}
                          name={fieldName}
                          value={bodyFatForm[fieldName]}
                          placeholder={calculatorConstants.BodyFatFieldLabels[fieldName]}
                          onChange={onInputChange.bind(null)}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Form>
            </Col>
          </Row>
        </section>
      </Col>
    </Row>
  );
}

export default BodyFatCalculator;
