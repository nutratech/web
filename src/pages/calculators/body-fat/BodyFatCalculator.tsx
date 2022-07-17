import type { ChangeEvent } from "react";
import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import * as calculatorConstants from "../../../constants/calculator-constants";
import type BodyFatForm from "../../../models/BodyFatForm";
import type BodyFatResponse from "../../../models/BodyFatResponse";
import CalculatorService from "../../../services/calculator/CalculatorService";

function BodyFatCalculator(): JSX.Element {
  const [bodyFatForm, setBodyFatForm] = useState({} as BodyFatForm);
  const [bodyFatData, setBodyFatData] = useState({} as BodyFatResponse);

  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>): Promise<void> => {
    formEvent.preventDefault();
    // TODO: dispatch action to trigger API call instead of calling directly
    const bodyFatResponse = await CalculatorService.calculateBodyFatPercentage(bodyFatForm);
    setBodyFatData(bodyFatResponse);
  };

  const onInputChange = (
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    if (!evt.target.value) {
      return;
    }

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
                  void handleSubmit(evt);
                }}
              >
                <Row>
                  {
                    calculatorConstants.BodyFatFieldNames
                      .filter((fieldName) =>
                        // eslint-disable-next-line implicit-arrow-linebreak
                        calculatorConstants.BodyFatFieldOptions[fieldName].length > 0
                      // eslint-disable-next-line function-paren-newline
                      ).map((fieldName) => <Col lg="6" key={fieldName}>
                        <Form.Group>
                          <Form.Label>
                            {calculatorConstants.BodyFatFieldLabels[fieldName]}
                          </Form.Label>
                          <Form.Select
                            name={fieldName}
                            value={bodyFatForm[fieldName]}
                            placeholder={calculatorConstants.BodyFatFieldLabels[fieldName]}
                            onChange={(evt): void => {
                              onInputChange(evt);
                            }}
                            aria-label={calculatorConstants.BodyFatFieldLabels[fieldName]}
                          >
                            <option>
                              Select {calculatorConstants.BodyFatFieldLabels[fieldName]}
                            </option>
                            {
                              calculatorConstants.BodyFatFieldOptions[fieldName].map((option) =>
                                // eslint-disable-next-line implicit-arrow-linebreak
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.name}
                                </option>
                              // eslint-disable-next-line function-paren-newline
                              )
                            }
                          </Form.Select>
                        </Form.Group>
                      </Col>)
                  }
                  {
                    calculatorConstants.BodyFatFieldNames
                      .filter((fieldName) =>
                        // eslint-disable-next-line implicit-arrow-linebreak
                        calculatorConstants.BodyFatFieldOptions[fieldName].length <= 0
                      // eslint-disable-next-line function-paren-newline
                      ).map((fieldName) => <Col lg="6" key={fieldName}>
                        <Form.Group>
                          <Form.Label>
                            {calculatorConstants.BodyFatFieldLabels[fieldName]}
                          </Form.Label>
                          <Form.Control
                            type={calculatorConstants.BodyFatFieldTypes[fieldName]}
                            name={fieldName}
                            value={bodyFatForm[fieldName]}
                            placeholder={calculatorConstants.BodyFatFieldLabels[fieldName]}
                            onChange={(evt): void => {
                              onInputChange(evt);
                            }}
                          />
                        </Form.Group>
                      </Col>)
                  }
                </Row>
                <Row>
                  <Col lg="12">
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  </Col>
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
