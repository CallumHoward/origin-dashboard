import * as React from "react";
import * as ReactDOM from "react-dom";
import { Hello } from "./components/Hello";
declare module "react-table";
declare let module: any;

import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(<Hello />, document.getElementById("root"));
