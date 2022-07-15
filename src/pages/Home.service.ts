import type { NavigateFunction } from "react-router";

function viewCalculators(navigate: NavigateFunction): void {
  navigate("/calculators/body-fat");
}

export default {
  viewCalculators,
};
