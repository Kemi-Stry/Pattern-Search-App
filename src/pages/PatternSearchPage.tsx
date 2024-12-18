import { useState, useRef } from "react";
import { stats, naive, kmp, bm, rk} from "../modules/algorithms/PaternSearch.ts";

const PatterSearchPage = () => {
    const [text, setText] = useState<string>("");
    const [pattern, setPattern] = useState<string>("");
    const [algorithm, setAlgorithm] = useState<string>("naive");
    const [step, setStep] = useState<number>(1);
    const [maxSteps, setMaxSteps] = useState<number>(0);
    const canvasRef = useRef<HTMLCanvasElement>(null)

    let x = 10;

    function handleAlgorithm(): void
    {
        const canvas = canvasRef.current?.getContext("2d");
        if (canvas)
        {
            canvas.clearRect(0, 0, 100, 100);
            canvas.font = "24px Arial";
            canvas.fillText(text, 10, 25);
            canvas?.fillText(pattern, x, 50);
        }
        
        let stats: stats;
        switch (algorithm) {
            case "naive":
                console.log("algorytm naiwny")
                stats = naive(text, pattern)
                setMaxSteps(stats.maxStep);
                break;
            
            case "kmp":
                console.log("algorytm knutha-morrisa-pratta")
                stats = kmp(text, pattern);
                setMaxSteps(stats.maxStep);
                break;
               
            case "bm":
                console.log("algorytm boyera-moora")
                stats = bm(text, pattern);
                setMaxSteps(stats.maxStep);
                break;
                
            case "rk":
                console.log("algorytm rabina-karpa")
                stats = rk(text, pattern, 10, 16777213);
                setMaxSteps(stats.maxStep);
                break;    
        
            default:
                break;
        }
    }

    function handleStep()
    {
        const canvas = canvasRef.current?.getContext("2d");
        x = x + 10;
        canvas?.fillText(pattern, x, 50);
        
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

            <canvas ref={canvasRef} id="myCanvas" width="200" height="100"></canvas>
            <div className="flex">
                <label htmlFor="steps">{"krok: "+step}</label>
                <input type="range" id="steps" min="1" max={maxSteps} defaultValue={1} onChange={(e) => {setStep(parseInt(e.target.value)); handleStep()}}/>
            </div>
            <button onClick={handleAlgorithm}>Wykonaj algorytm</button>
        </div>
    );
}

export default PatterSearchPage;
