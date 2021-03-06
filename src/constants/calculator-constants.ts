export type BodyFatFieldName =
  | "abd"
  | "age"
  | "chest"
  | "gender"
  | "height"
  | "hip"
  | "mid"
  | "neck"
  | "sub"
  | "sup"
  | "thigh"
  | "tricep"
  | "waist";

export type FieldType = "number" | "text";

export const BodyFatFieldNames: BodyFatFieldName[] = [
  "gender",
  "age",
  "height",
  "waist",
  "hip",
  "neck",
  "chest",
  "abd",
  "thigh",
  "tricep",
  "sub",
  "sup",
  "mid",
];

export const BodyFatFieldTypes: { [key in BodyFatFieldName]: FieldType } = {
  gender: "text",
  age: "number",
  height: "number",
  waist: "number",
  hip: "number",
  neck: "number",
  chest: "number",
  abd: "number",
  thigh: "number",
  tricep: "number",
  sub: "number",
  sup: "number",
  mid: "number",
};

export const BodyFatFieldLabels: { [key in BodyFatFieldName]: string } = {
  gender: "Gender",
  age: "Age",
  height: "Height (cm)",
  waist: "Waist (cm)",
  hip: "Hip (cm)",
  neck: "Neck (cm)",
  chest: "Chest (mm)",
  abd: "Abdominal (mm)",
  thigh: "Thigh (mm)",
  tricep: "Tricep (mm)",
  sub: "Sub (mm)",
  sup: "Sup (mm)",
  mid: "Mid (mm)",
};

// prettier-ignore
export const enum Gender {
  Male = "MALE",
  Female = "FEMALE"
}

export const BodyFatFieldOptions: {
  [key in BodyFatFieldName]: {
    name: string;
    value: string;
  }[];
} = {
  gender: [
    {
      name: "Male",
      value: Gender.Male,
    },
    {
      name: "Female",
      value: Gender.Female,
    },
  ],
  age: [],
  height: [],
  waist: [],
  hip: [],
  neck: [],
  chest: [],
  abd: [],
  thigh: [],
  tricep: [],
  sub: [],
  sup: [],
  mid: [],
};

// prettier-ignore
export enum BodyFatTestType {
  navy = "navy",
  threeSite = "threeSite",
  sevenSite = "sevenSite"
}

export type BodyFatTestKeyType = "navy" | "sevenSite" | "threeSite";

export const BodyFatTestTypes: BodyFatTestKeyType[] = ["navy", "threeSite", "sevenSite"];

export const BodyFatTestNames: { [key in BodyFatTestKeyType]: string } = {
  navy: "Navy",
  threeSite: "Three-site",
  sevenSite: "Seven-site",
};

export const RequiredFields: { [key in BodyFatTestKeyType]: BodyFatFieldName[] } = {
  navy: ["gender", "neck", "waist", "hip", "height"],
  threeSite: ["gender", "age", "abd", "chest", "thigh"],
  sevenSite: ["gender", "age", "abd", "chest", "thigh", "mid", "sub", "sup", "tricep"],
};
