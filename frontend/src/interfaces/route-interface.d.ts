import type { JSX } from "react";

export interface IRoute {
  "name": string;
  "path": string;
  "element": JSX.Element;
}
