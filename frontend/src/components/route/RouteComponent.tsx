import { Route, Routes } from "react-router-dom";
import { RouteSetting } from "../../settings/RouteSetting";
import type { IRoute } from "../../interfaces/route-interface";
import Template from "../../templates/Template";

function RouteComponent() {
  return (
    <Template>
      <Routes>
        {RouteSetting.map((menu: IRoute, index) => (
          <Route key={index} path={menu.path} element={menu.element} />
        ))}
      </Routes>
    </Template>
  );
}

export default RouteComponent;
