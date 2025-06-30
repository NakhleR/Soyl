import { BrowserRouter, Routes, Route } from "react-router-dom";
import WorkInProgress from "@/pages/WorkInProgress";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<WorkInProgress />} />
      <Route path="*" element={<WorkInProgress />} />
    </Routes>
  </BrowserRouter>
);

export default App;