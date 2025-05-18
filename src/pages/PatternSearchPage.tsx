import { useState, useRef, useEffect } from "react";
import { stats, naive, kmp, bm, rk } from "../modules/algorithms/PaternSearch.ts";
import * as d3 from "d3";
import styles from "./styles/PatterSearch.module.css";

const PatterSearchPage = () => {
    const [text, setText] = useState<string>("");
    const [pattern, setPattern] = useState<string>("");
    const [algorithm, setAlgorithm] = useState<string>("naive");
    const [step, setStep] = useState<number>(1);
    const [maxSteps, setMaxSteps] = useState<number>(0);
    const svgRef = useRef<SVGSVGElement>(null);

    const shifts = useRef<number[]>([]);
    const currentIndex = useRef<number>(0);

    useEffect(() => {
        setStep(1);
        currentIndex.current = 0
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
            .attr("font-family", "monospace")
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
            .attr("font-family", "monospace")
            .attr("font-size", "24px")
    }, 
    [text, pattern, algorithm])

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

    // Compute algoritms and stastics
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
                console.log("porównań ", stats.comparisons)

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
                console.log("dopasowanie: ",stats.indexes);

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
            {
                let lenght = shift - currentIndex.current;
                console.log("\nshift: ",shift);
                console.log("index: ", currentIndex.current);
                console.log("distance: ", lenght);
                return parseInt(d3.select(this).attr("x")) + 20 * lenght; 
            }
            else
            {
                let lenght = shift - currentIndex.current;
                console.log("\nshift: ",shift);
                console.log("index: ", currentIndex.current);
                console.log("distance: ", lenght);
                return parseInt(d3.select(this).attr("x")) + 20 * lenght;
            }
        })
    }

    function nextStep(): void
    {
        if (step !== maxSteps)
        {
            setStep(step+1);
            shiftText(shifts.current[step-1], true);
            currentIndex.current = shifts.current[step-1];

            // console.log("INDEX: ",currentIndex);
            // console.log("STEP: ",step);
        }
    }

    function previousStep(): void
    {
        if (step !== 1)
        {
            setStep(step-1);
            shiftText(shifts.current[step-2], false);  
            currentIndex.current = shifts.current[step-2];

            // console.log("INDEX: ",currentIndex);
            // console.log("STEP: ",step);
        }
    }

    return (
        <div className="content">
            <div className={styles.vertical}>
                <h1 className={styles.centered}>Wyszukiwanie wzorca w tekście</h1>
                <label htmlFor="algorthm">Algorytm:</label>
                <select id="algorithm" onChange={(e) => setAlgorithm(e.target.value)}>
                    <option value="naive">Naiwny</option>
                    <option value="kmp">Knutha-Morrisa-Pratta</option>
                    <option value="bm">Boyera-Moore'a</option>
                    <option value="rk">Rabina-Karpa</option>
                </select>
                <div className={styles.horizontal}>
                    <label htmlFor="text1">Ciąg znaków:</label>
                    <input type="text" name="text1" id="text1" onChange={(e) => setText(e.target.value)}/>
                    <label htmlFor="text2">Szukany wzorzec:</label>
                    <input type="text" name="text2" id="text2" onChange={(e) => setPattern(e.target.value)} />
                </div>
                <svg ref={svgRef}></svg>
                <label className={styles.centered} htmlFor="steps">{"Przesunięcie: "+step}</label>
                <div className="flex">
                    <button className={styles.button} onClick={previousStep}><p className={styles.graph}>&lArr;</p> Poprzednie przesunięcie</button>
                    <button className={styles.button} onClick={nextStep}>Następny przesunięcie<p className={styles.graph}>&rArr;</p></button>
                </div>
                <button onClick={handleAlgorithm}>Wykonaj algorytm</button>
            </div>
        </div>
    );
}

export default PatterSearchPage;
