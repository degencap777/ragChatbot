import { Playground } from "@pages/playground";
import { Route, Routes} from "react-router-dom";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Playground />} />
    </Routes>
  );
};
