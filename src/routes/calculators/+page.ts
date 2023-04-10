// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// One rep max
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const commonNReps = [1, 2, 3, 5, 6, 8, 10, 12, 15, 20];

function ormEpley(weight: number, reps: number): Record<number, number> {
	const oneRepMax = reps <= 0 ? 0 : Math.round(weight * (1 + (reps - 1) / 30));

	const result: Record<number, number> = { 0: 0 };
	for (const n of commonNReps) {
		result[n] = Math.round((oneRepMax * 30) / (29 + Number(n)));
	}
	return result;
}

function ormBrzycki(weight: number, reps: number): Record<number, number> {
	const oneRepMax = reps <= 0 ? 0 : Math.round((weight * 36) / (36.995 - reps + 0.005 * reps ** 2));

	const result: Record<number, number> = { 0: 0 };
	for (const n of commonNReps) {
		result[n] = Math.round((oneRepMax * (36.995 - Number(n) + 0.005 * Number(n) ** 2)) / 36);
	}
	return result;
}

function ormDosRemedios(weight: number, reps: number): Record<number, number> {
	const maxRepRatios: Record<number, number> = {
		1: 1,
		2: 0.92,
		3: 0.9,
		4: 0.89, // NOTE: I added this
		5: 0.87,
		6: 0.82,
		7: 0.781, // NOTE: I added this
		8: 0.75,
		9: 0.72375, // NOTE: I added this
		10: 0.7,
		11: 0.674286, // NOTE: I added this
		12: 0.65,
		13: 0.628571, // NOTE: I added this
		14: 0.611429, // NOTE: I added this
		15: 0.6,
		16: 0.588, // NOTE: I added this
		17: 0.5775, // NOTE: I added this
		18: 0.568, // NOTE: I added this
		19: 0.559, // NOTE: I added this
		20: 0.55 // NOTE: I added this, 20 reps is NOT in the original equation.
	};
	const oneRepMax = reps <= 0 ? 0 : Math.round(weight / maxRepRatios[reps]);

	const result: Record<number, number> = { 0: 0 };
	for (const n of commonNReps) {
		result[n] = Math.round(oneRepMax * maxRepRatios[Number(n)]);
	}
	return result;
}

export function _calcOrmTableData(weight: number, reps: number): number[][] {
	// Compute results
	const epleyResults = ormEpley(weight, reps);
	const brzyckiResults = ormBrzycki(weight, reps);
	const dosRemediosResults = ormDosRemedios(weight, reps);

	const rows = [];
	for (const n of commonNReps) {
		const row: number[] = [Number(n), epleyResults[n], brzyckiResults[n], dosRemediosResults[n]];
		rows.push(row);
	}

	// Return them
	return rows;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// BMR
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const activityFactors = [0.2, 0.375, 0.55, 0.725, 0.9];
function bmrKatchMcardle(activityFactor: number, weight: number, bodyFat: number): number[] {
	const lbm = weight * (1 - bodyFat);
	const bmr = 370 + 21.6 * lbm;
	const tdee = bmr * (1 + activityFactor);

	return [Math.round(bmr), Math.round(tdee)];
}

function bmrCunningham(activityFactor: number, weight: number, bodyFat: number): number[] {
	const lbm = weight * (1 - bodyFat);
	const bmr = 500 + 22 * lbm;
	const tdee = bmr * (1 + activityFactor);

	return [Math.round(bmr), Math.round(tdee)];
}

function bmrMifflinStJeor(
	activityFactor: number,
	weight: number,
	gender: string,
	height: number,
	age: number
): number[] {
	function genderSpecificBMR(bmr: number) {
		const _secondTerm: Record<string, number> = {
			MALE: 5,
			FEMALE: -161
		};
		return bmr + _secondTerm[gender];
	}

	const bmr = genderSpecificBMR(10 * weight + 6.25 + 6.25 * height - 5 * age);
	const tdee = bmr * (1 + activityFactor);

	return [Math.round(bmr), Math.round(tdee)];
}

function bmrHarrisBenedict(
	activityFactor: number,
	weight: number,
	gender: string,
	height: number,
	age: number
): number[] {
	function genderSpecificBMR() {
		const genderSpecificBmr: Record<string, number> = {
			MALE: 13.397 * weight + 4.799 * height - 5.677 * age + 88.362,
			FEMALE: 9.247 * weight + 3.098 * height - 4.33 * age + 447.593
		};
		return genderSpecificBmr[gender];
	}

	const bmr = genderSpecificBMR();
	const tdee = bmr * (1 + activityFactor);

	return [Math.round(bmr), Math.round(tdee)];
}

export function _calcBmrTableData(
	activityLevel: number,
	weight: number,
	bodyFat: number | null,
	gender: string,
	height: number | null,
	age: number | null
): (number | string)[][] {
	const activityFactor = activityFactors[activityLevel];

	// Compute results
	let rows =
		bodyFat != null ? bmrKatchMcardle(activityFactor, weight, bodyFat / 100) : [String(), String()];
	const resultsKatchMcArdle = ['Katch McArdle', ...rows];

	rows =
		bodyFat != null ? bmrCunningham(activityFactor, weight, bodyFat / 100) : [String(), String()];
	const resultsCunningham = ['Cunningham', ...rows];

	rows =
		height != null && age != null
			? bmrMifflinStJeor(activityFactor, weight, gender, height, age)
			: [String(), String()];
	const resultsMifflinStJeor = ['Mifflin St Jeor', ...rows];

	rows =
		height != null && age != null
			? bmrHarrisBenedict(activityFactor, weight, gender, height, age)
			: [String(), String()];
	const resultsHarrisBenedict = ['Harris Benedict', ...rows];

	// Return them
	return [resultsKatchMcArdle, resultsCunningham, resultsMifflinStJeor, resultsHarrisBenedict];
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Body fat
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function bfNavy(
	gender: string,
	height: number,
	waist: number,
	neck: number,
	hip: number | null
): number {
	// Validate and assign default to nullable "hip"
	if (gender == 'FEMALE' && !hip) {
		return 0;
	} else if (gender == 'MALE') {
		hip = 0; // placeholder value, not used for men anyway
	}

	const genderSpecificDenominator: Record<string, number> = {
		MALE: 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height),
		FEMALE: 1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)
	};

	return Number((495 / genderSpecificDenominator[gender] - 450).toFixed(2));
}

function bf3Site(): number {}

function bf7Site(): number {}

export function _calcBfTableData(
	gender: string,
	age: number | null,
	height: number | null,
	waist: number | null,
	neck: number | null,
	hip: number | null
): number[] {
	const navy =
		height != null && waist != null && neck != null ? bfNavy(gender, height, waist, neck, hip) : [];
	const threeSite = bf3Site();
	const sevenSite = bf7Site();

	return [navy, threeSite, sevenSite];
}
