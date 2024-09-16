import { useState } from "react";
import { naive, kmp, bm, rp } from "../modules/algorithms";

const PatterSearchPage = () => {
    const [text, setText] = useState<string>("");
    const [pattern, setPattern] = useState<string>("");
    const [algorithm, setAlgorithm] = useState<string>("naive");
    const [step, setStep] = useState<number>(1);
    const [maxSteps, setMaxSteps] = useState<number>(0);

    function handleAlgorithm(): void
    {
        switch (algorithm) {
            case "naive":
                console.log("algorytm naiwny")
                break;
            
            case "kmp":
                const stats = kmp(text, pattern);
                setMaxSteps(stats.maxStep);
                break;
               
            case "bm":
                console.log("algorytm boyera-moora")
                break;
                
            case "rk":
                console.log("algorytm rabina-karpa")
                break;    
        
            default:
                break;
        }
    }

    return (
        <div className="content">
            <h1>Wyszukiwanie wzorca w tekście</h1>
            <div className="flex">
                <label htmlFor="algorthm">algorytm:</label>
                <select id="algorithm" onChange={(e) => setAlgorithm(e.target.value)}>
                    <option value="naive">Naiwny</option>
                    <option value="kmp">Knutha-Morrisa-Pratta</option>
                    <option value="bm">Boyera-Moore'a</option>
                    <option value="rk">Rabina-Karpa</option>
                </select>
                <label htmlFor="text1">Ciąg znaków:</label>
                <input type="text" name="text1" id="text1" onChange={(e) => setText(e.target.value)}/>
                <label htmlFor="text2">Szukany wzorzec:</label>
                <input type="text" name="text2" id="text2" onChange={(e) => setPattern(e.target.value)} />
            </div>

            <h1>{text}</h1>
            <h1>{pattern}</h1>
            <div className="flex">
                <label htmlFor="steps">{"krok: "+step}</label>
                <input type="range" id="steps" min="1" max={maxSteps} defaultValue={1} onChange={(e) => setStep(parseInt(e.target.value))}/>
            </div>
            <button onClick={handleAlgorithm}>Wykonaj algorytm</button>
        </div>
    );
}

export default PatterSearchPage;
