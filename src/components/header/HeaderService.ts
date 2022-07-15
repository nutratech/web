import type { NavigateFunction } from "react-router";

const navigateRouter = (navigate: NavigateFunction, pathname: string): void => {
  navigate({ pathname });
};

export default {
  navigateRouter,
};
