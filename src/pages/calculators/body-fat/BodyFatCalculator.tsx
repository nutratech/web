import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import BodyFatForm from "../../../models/BodyFatForm";
import BodyFatResponse from "../../../models/BodyFatResponse";
import CalculatorService from "../../../services/calculator/CalculatorService";

function BodyFatCalculator() {
  const [bodyFatData, setBodyFatData] = useState({} as BodyFatResponse);

  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>): void => {
    formEvent.preventDefault();
    // TODO: dispatch action to trigger API call instead of calling directly
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    const formDataObject = Object.fromEntries(data);
    const appFormData = formDataObject as unknown as BodyFatForm;
    CalculatorService.calculateBodyFatPercentage(appFormData).then((bodyFatResponse) => {
      setBodyFatData(bodyFatResponse);
    });
  };

  return (
    <section id="body-fat-calculator">
      <h6>
        Result:
        {" "}
        { JSON.stringify(bodyFatData) }
      </h6>
      <Form onSubmit={(form) => handleSubmit(form)}>
        <Form.Group>
          <Form.Label>Gender</Form.Label>
          <Form.Control type="text" name="gender" placeholder="Gender" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Age</Form.Label>
          <Form.Control type="text" name="age" placeholder="Age" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Height</Form.Label>
          <Form.Control type="text" name="height" placeholder="Height" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Waist</Form.Label>
          <Form.Control type="text" name="waist" placeholder="Waist" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Hip</Form.Label>
          <Form.Control type="text" name="hip" placeholder="Hip" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Neck</Form.Label>
          <Form.Control type="text" name="neck" placeholder="Neck" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Chest</Form.Label>
          <Form.Control type="text" name="chest" placeholder="Chest" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Ab</Form.Label>
          <Form.Control type="text" name="ab" placeholder="Ab" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Thigh</Form.Label>
          <Form.Control type="text" name="thigh" placeholder="Thigh" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Tricep</Form.Label>
          <Form.Control type="text" name="tricep" placeholder="Tricep" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Sub</Form.Label>
          <Form.Control type="text" name="sub" placeholder="Sub" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Sup</Form.Label>
          <Form.Control type="text" name="sup" placeholder="Sup" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Mid</Form.Label>
          <Form.Control type="text" name="mid" placeholder="Mid" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </section>
  );
}

export default BodyFatCalculator;
