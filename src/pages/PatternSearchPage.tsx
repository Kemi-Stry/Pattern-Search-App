import { useState, useRef, useEffect } from "react";
import {
	stats,
	naive,
	kmp,
	bm,
	rk,
} from "../modules/algorithms/PaternSearch.ts";
import * as d3 from "d3";
import styles from "./styles/PatterSearch.module.css";

const PatterSearchPage = () => {
	const [text, setText] = useState<string>("");
	const [pattern, setPattern] = useState<string>("");
	const [algorithm, setAlgorithm] = useState<string>("naive");
	const [step, setStep] = useState<number>(0);
	const [maxSteps, setMaxSteps] = useState<number>(0);
	const [statistics, setStatistics] = useState<stats>();

	const svgRef = useRef<SVGSVGElement>(null);
	const shifts = useRef<number[]>([]);
	const currentIndex = useRef<number>(0);

	useEffect(() => {
		setStep(0);
		currentIndex.current = 0;
		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		// Render tekstu
		svg
			.append("text")
			.attr("id", "string")
			.selectAll("tspan")
			.data(text.split(""))
			.enter()
			.append("tspan")
			.attr("x", (_d, i) => 20 * i + 20)
			.attr("y", 50)
			.text((d) => d)
			.attr("font-family", "monospace")
			.attr("font-size", "24px");

		// Render wzorca
		svg
			.append("text")
			.attr("id", "pattern")
			.selectAll("tspan")
			.data(pattern.split(""))
			.enter()
			.append("tspan")
			.attr("x", (_d, i) => 20 * i + 20)
			.attr("y", 100)
			.text((d) => d)
			.attr("font-family", "monospace")
			.attr("font-size", "24px");
	}, [text, pattern, algorithm]);

	// Aktualizacja przesunięcia i kolorowania wzorca
	useEffect(() => {
		const svg = d3.select(svgRef.current);
		let shiftValue = 0;
		if (step > 0) {
			// Dla kroku 1 pobieramy element o indeksie 0, dla kroku 2 indeks 1, itd.
			shiftValue = shifts.current[step - 1] ?? 0;
			svg
				.select("#pattern")
				.selectAll("tspan")
				.transition()
				.duration(500)
				.attr("x", (_d, i) => 20 * i + 20 + 20 * shiftValue);
			currentIndex.current = shiftValue;
			console.log("Step:", step, "Index:", shiftValue);
		} else {
			// Początkowa pozycja wzorca
			svg
				.select("#pattern")
				.selectAll("tspan")
				.transition()
				.duration(500)
				.attr("x", (_d, i) => 20 * i + 20);
		}
		// Przekazujemy wartość przesunięcia bezpośrednio do funkcji kolorowania
		colorPattern(shiftValue);
	}, [step]);

	// Funkcja do oznaczania pasujących fragmentów tekstu
	function highlightMatch(index: number): void {
		const svg = d3.select(svgRef.current);
		const string = svg.select("#string").selectAll("tspan");

		let i = 0;
		while (i < pattern.length) {
			string.filter((_d, a) => a === index + i).attr("fill", "green");
			i++;
		}
	}

	function colorPattern(shift: number): void {
		const svg = d3.select(svgRef.current);
		const string = svg.select("#string").selectAll("tspan");
		const patternTspans = svg.select("#pattern").selectAll("tspan");

		patternTspans.attr("fill", function (_d, i) {
			const textChar = string.filter((_d, a) => a === shift + i).text() || "";
			const patternChar = d3.select(this).text();
			return textChar === patternChar ? "green" : "red";
		});

		console.log(`colorPattern: shift=${shift}`);
	}

	function handleAlgorithm(): void {
		let statsResult: stats;
		switch (algorithm) {
			case "naive":
				console.log("algorytm naiwny");
				statsResult = naive(text, pattern);
				shifts.current = statsResult.shifts;
				setStatistics(statsResult);
				console.log("przesunięcia: ", shifts.current);
				console.log("dopasowanie: ", statsResult.indexes);
				console.log("porównań ", statsResult.comparisons);

				setMaxSteps(statsResult.maxStep);
				for (const index of statsResult.indexes) {
					highlightMatch(index);
				}
				// Inicjalne kolorowanie - wzorzec jeszcze nie został przesunięty
				colorPattern(0);
				break;

			case "kmp":
				console.log("algorytm knutha-morrisa-pratta");
				statsResult = kmp(text, pattern);
				setStatistics(statsResult);
				shifts.current = statsResult.shifts;
				setMaxSteps(statsResult.maxStep);
				for (const index of statsResult.indexes) {
					highlightMatch(index);
				}
				colorPattern(0);
				break;

			case "bm":
				console.log("algorytm boyera-moory");
				statsResult = bm(text, pattern);
				setStatistics(statsResult);
				shifts.current = statsResult.shifts;
				setMaxSteps(statsResult.maxStep);
				for (const index of statsResult.indexes) {
					highlightMatch(index);
				}
				colorPattern(0);
				break;

			case "rk":
				console.log("algorytm rabina-karpa");
				statsResult = rk(text, pattern, 10, 16777213);
				setStatistics(statsResult);
				shifts.current = statsResult.shifts;
				setMaxSteps(statsResult.maxStep);
				for (const index of statsResult.indexes) {
					highlightMatch(index);
				}
				colorPattern(0);
				break;

			default:
				break;
		}
	}

	function nextStep(): void {
		if (step < maxSteps - 1) setStep((prevStep) => prevStep + 1);
	}

	function previousStep(): void {
		if (step > 0) setStep((prevStep) => prevStep - 1);
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
					<input
						type="text"
						name="text1"
						id="text1"
						onChange={(e) => setText(e.target.value)}
					/>
					<label htmlFor="text2">Szukany wzorzec:</label>
					<input
						type="text"
						name="text2"
						id="text2"
						onChange={(e) => setPattern(e.target.value)}
					/>
				</div>
				<svg ref={svgRef}></svg>
				<label className={styles.centered} htmlFor="steps">
					{"Przesunięcie: " + step}
				</label>
				<div className="flex">
					<button className={styles.button} onClick={previousStep}>
						<p className={styles.graph}>&lArr;</p> Poprzednie przesunięcie
					</button>
					<button className={styles.button} onClick={nextStep}>
						Następne przesunięcie<p className={styles.graph}>&rArr;</p>
					</button>
				</div>
				<button onClick={handleAlgorithm}>Wykonaj algorytm</button>
			</div>
			<div className="stats">
				<p>{"Znaleziono wzorzec w indeksach: " + statistics?.indexes}</p>
				<p>{"Liczba przesunięć: " + statistics?.maxStep}</p>
				<p>{"Liczba porównań: " + statistics?.comparisons}</p>
				{statistics?.lastoccurence && <p>{statistics.lastoccurence}</p>}
			</div>
		</div>
	);
};

export default PatterSearchPage;
