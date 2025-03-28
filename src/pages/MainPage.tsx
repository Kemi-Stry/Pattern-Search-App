import { Link } from "react-router-dom";

const MainPage = () => {
    return (
        <div>
            <div className="flex">
                <h1>Algorytmy i Struktury Danych</h1>
                <Link to={"/wyszukiwanie-wzorcow"}>Wyszukiwanie Wzorców w Tekście</Link>
            </div>
        </div>
    );
}

export default MainPage;