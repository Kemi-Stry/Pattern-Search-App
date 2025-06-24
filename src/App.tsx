import { Route, Routes, HashRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import PatterSearchPage from "./pages/PatternSearchPage";
import TestPage from "./pages/TestPage";
import "./App.css";

const App = () => {
	return (
		<HashRouter>
			<Routes>
				<Route path={"/"} element={<MainPage />} />
				<Route path={"/wyszukiwanie-wzorcow"} element={<PatterSearchPage />} />
				<Route path={"/test"} element={<TestPage />} />
			</Routes>
		</HashRouter>
	);
};

export default App;
