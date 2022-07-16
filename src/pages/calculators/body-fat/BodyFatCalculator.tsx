import type { ChangeEvent } from "react";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
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
    <section id="body-fat-calculator">
      <h6>
        Result:
        {JSON.stringify(bodyFatData)}
      </h6>
      <Form
        onSubmit={(evt): void => {
          void handleSubmit(evt);
        }}
      >
        <Form.Group>
          <Form.Label>Gender</Form.Label>
          <Form.Select
            name="gender"
            value={bodyFatForm.gender}
            placeholder="Gender"
            aria-label="Gender"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          >
            <option>Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Age</Form.Label>
          <Form.Control
            type="number"
            name="age"
            value={bodyFatForm.age}
            placeholder="Age"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Height</Form.Label>
          <Form.Control
            type="number"
            name="height"
            value={bodyFatForm.height}
            placeholder="Height"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Waist</Form.Label>
          <Form.Control
            type="number"
            name="waist"
            value={bodyFatForm.waist}
            placeholder="Waist"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Hip</Form.Label>
          <Form.Control
            type="number"
            name="hip"
            value={bodyFatForm.hip}
            placeholder="Hip"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Neck</Form.Label>
          <Form.Control
            type="number"
            name="neck"
            value={bodyFatForm.neck}
            placeholder="Neck"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Chest</Form.Label>
          <Form.Control
            type="number"
            name="chest"
            value={bodyFatForm.chest}
            placeholder="Chest"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Ab</Form.Label>
          <Form.Control
            type="number"
            name="ab"
            value={bodyFatForm.ab}
            placeholder="Ab"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Thigh</Form.Label>
          <Form.Control
            type="number"
            name="thigh"
            value={bodyFatForm.thigh}
            placeholder="Thigh"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Tricep</Form.Label>
          <Form.Control
            type="number"
            name="tricep"
            value={bodyFatForm.tricep}
            placeholder="Tricep"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Sub</Form.Label>
          <Form.Control
            type="number"
            name="sub"
            value={bodyFatForm.sub}
            placeholder="Sub"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Sup</Form.Label>
          <Form.Control
            type="number"
            name="sup"
            value={bodyFatForm.sup}
            placeholder="Sup"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Mid</Form.Label>
          <Form.Control
            type="number"
            name="mid"
            value={bodyFatForm.mid}
            placeholder="Mid"
            onChange={(evt): void => {
              onInputChange(evt);
            }}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </section>
  );
}

export default BodyFatCalculator;
