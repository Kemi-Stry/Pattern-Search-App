import { useState, useRef, useEffect } from "react";
import { stats, naive, kmp, bm, rk} from "../modules/algorithms/PaternSearch.ts";
import * as d3 from "d3";

const PatterSearchPage = () => {
    const [text, setText] = useState<string>("");
    const [pattern, setPattern] = useState<string>("");
    const [algorithm, setAlgorithm] = useState<string>("naive");
    const [step, setStep] = useState<number>(1);
    const [maxSteps, setMaxSteps] = useState<number>(0);
    const svgRef = useRef<SVGSVGElement>(null)

    const shifts = useRef<number[]>([]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        //render text
        svg.append("text")
            .attr("id", "string")
            .selectAll("tspan")
            .data(text.split(""))
            .enter()
            .append("tspan")
            .attr("x", (_d, i) => 20 * i + 20)
            .attr("y", 50)
            .text(d => d)
            .attr("font-family", "Consolas")
            .attr("font-size", "24px")

        // render pattern
        svg.append("text")
            .attr("id", "pattern")
            .selectAll("tspan")
            .data(pattern.split(""))
            .enter()
            .append("tspan")
            .attr("x", (_d, i) => 20 * i + 20)
            .attr("y", 100)
            .text(d => d)
            .attr("font-family", "Consolas")
            .attr("font-size", "24px")
            
    }, 
    [text, pattern])

    // Highlight pattern match
    function highlightMatch(index: number): void
    {
        const svg = d3.select(svgRef.current);
        const string = svg.select("#string").selectAll("tspan");
        
        let i = 0;
        while(i < pattern.length)
        {
            string.filter((_d, a) => a == index+i).attr("fill", "green")
            i++;
        }
    }

    function handleAlgorithm(): void
    {        
        let stats: stats;
        switch (algorithm) {
            case "naive":
                console.log("algorytm naiwny")
                stats = naive(text, pattern)
                shifts.current = stats.shifts

                console.log("przesunięcia: ", shifts.current);
                console.log("dopasowanie: ",stats.indexes)

                setMaxSteps(stats.maxStep);
                for(const index of stats.indexes)
                {
                    highlightMatch(index);
                }
                break;
            
            case "kmp":
                console.log("algorytm knutha-morrisa-pratta")
                stats = kmp(text, pattern);
                shifts.current = stats.shifts

                console.log("przesunięcia: ", shifts.current);
                console.log("dopasowanie: ",stats.indexes)

                setMaxSteps(stats.maxStep);
                for(const index of stats.indexes)
                {
                    highlightMatch(index);
                }
                break;
               
            case "bm":
                console.log("algorytm boyera-moora")
                stats = bm(text, pattern);
                shifts.current = stats.shifts

                console.log("przesunięcia: ", shifts.current);
                console.log("dopasowanie: ",stats.indexes)

                setMaxSteps(stats.maxStep);
                for(const index of stats.indexes)
                {
                    highlightMatch(index);
                }
                break;
                
            case "rk":
                console.log("algorytm rabina-karpa")
                stats = rk(text, pattern, 10, 16777213);
                shifts.current = stats.shifts

                console.log("przesunięcia: ", shifts.current);
                console.log("dopasowanie: ",stats.indexes)

                setMaxSteps(stats.maxStep);
                for(const index of stats.indexes)
                {
                    highlightMatch(index);
                }
                break;    
        
            default:
                break;
        }
    }

    function shiftText(shift: number, right: boolean): void
    {
        const svg = d3.select(svgRef.current);
        svg.select("#pattern").selectAll("tspan").attr("x", function() {
            if(right)
                return parseInt(d3.select(this).attr("x")) + 20 * shift;
            else
                return parseInt(d3.select(this).attr("x")) - 20 * shift;
        })
    }

    function nextStep(): void
    {
        if (step !== maxSteps)
        {
            setStep(step+1);
            shiftText(shifts.current[step-1], true);
        }
    }

    function previousStep(): void
    {
        if (step !== 1)
        {
            setStep(step-1);
            shiftText(shifts.current[step-1], false);
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
            <svg ref={svgRef}></svg>
            <div className="flex">
                <label htmlFor="steps">{"krok: "+step}</label>
                <button onClick={previousStep}>Poprzedni krok</button>
                <button onClick={nextStep}>Następny krok</button>
            </div>
            <button onClick={handleAlgorithm}>Wykonaj algorytm</button>
        </div>
    );
}

export default PatterSearchPage;
