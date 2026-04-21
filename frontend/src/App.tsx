import { Route, Routes } from "react-router-dom";
import RouteComponent from "./components/route/RouteComponent";
import ParticlesBackground from "./components/ParticlesBackground";

function App() {
  return (
    <>
      <ParticlesBackground />
      <Routes>
        <Route path="/*" element={<RouteComponent />} />
      </Routes>
    </>
  );
}

export default App;
