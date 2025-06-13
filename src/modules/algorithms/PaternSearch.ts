export type stats = {
	maxStep: number; // liczba kroków \ przesunięć
	comparisons: number; // liczba porównań
	indexes: number[]; // indeksy pierwszego znaku w którym jest dopasowanie
	shifts: number[]; // przesunięcia (o ile przesunąć wzorzec w każdym kroku)

	//for BM
	lastoccurence?: Map<string, number>;
	//for KMP
	prefix?: string;
	//for rk
	hashComparisons?: number;
};

//Algorytm naiwny
export function naive(text: string, pattern: string): stats {
	let maxStep = 0;
	let commparisons = 0;
	const indexes: number[] = [];
	const shifts: number[] = [];
	for (let i = 0; i <= text.length - pattern.length; i++) {
		commparisons++;
		if (pattern === text.substring(i, i + pattern.length)) {
			indexes.push(i);
			commparisons += pattern.length - 1;
		}
		maxStep++;
		shifts.push(maxStep);
	}
	shifts.pop();
	return {
		maxStep: maxStep,
		comparisons: commparisons,
		indexes: indexes,
		shifts: shifts,
	};
}

function computePrefix(pattern: string): number[] {
	const pi = new Array(pattern.length).fill(0);
	let suffix = 0;

	for (let prefix = 1; prefix < pattern.length; prefix++) {
		while (suffix > 0 && pattern[suffix] !== pattern[prefix]) {
			suffix = pi[suffix - 1];
		}

		if (pattern[suffix] === pattern[prefix]) {
			suffix++;
		}

		pi[prefix] = suffix;
	}

	return pi;
}

export function kmp(text: string, pattern: string): stats {
	const indexes: number[] = [];
	const shifts: number[] = [];
	let maxStep = 0;
	const pi = computePrefix(pattern);
	let matches = 0;
	let comparisons = 0;
	const maxVisibleShift = text.length - pattern.length;

	maxStep++;
	let lastShift = 0;

	for (let i = 0; i < text.length; i++) {
		while (matches > 0 && pattern[matches] !== text[i]) {
			comparisons++;
			matches = pi[matches - 1];
		}

		comparisons++;
		if (pattern[matches] === text[i]) {
			matches++;
		}

		const currentShift = i - matches + 1;
		if (currentShift !== lastShift && currentShift <= maxVisibleShift && currentShift >= 0) {
			shifts.push(currentShift);
			maxStep++;
			lastShift = currentShift;
		}

		if (matches === pattern.length) {
			indexes.push(i - pattern.length + 1);
			matches = pi[matches - 1];
		}
	}

	// Filtrujemy wartości `0` i mapujemy na rzeczywiste prefiksy wzorca
	const prefixStr = pi
		.map(val => (val > 0 ? pattern.slice(0, val) : ""))
		.filter(s => s !== "")
		.join(", ");

	return {
		maxStep: maxStep,
		comparisons: comparisons,
		indexes: indexes,
		shifts: shifts,
		prefix: prefixStr, // Teraz zwraca rzeczywiste prefiksy wzorca
	};
}

// Algorytm Rabina-Karpa
export function rk(text: string, pattern: string, base: number, divisor: number): stats {
	const n = text.length;
	const m = pattern.length;

	if (m > n) {
		return { maxStep: 0, comparisons: 0, hashComparisons: 0, indexes: [], shifts: [] };
	}

	let maxStep = 0;
	let comparisons = 0;
	let hashComparisons = 0;
	const indexes: number[] = [];
	const shifts: number[] = [];

	const h = Math.pow(base, m - 1) % divisor;
	let patternHash = 0;
	let textHash = 0;

	// Obliczanie hash dla wzorca i pierwszego okna tekstu
	for (let i = 0; i < m; i++) {
		patternHash = (base * patternHash + pattern.charCodeAt(i)) % divisor;
		textHash = (base * textHash + text.charCodeAt(i)) % divisor;
	}

	// Algorytm RK
	for (let shift = 0; shift <= n - m; shift++) {
		// Rejestrujemy krok wizualizacji
		shifts.push(shift);
		maxStep++;

		// Porównanie wartości hash
		hashComparisons++;
		if (patternHash === textHash) {
			let j = 0;
			for (; j < m; j++) {
				comparisons++;
				if (pattern[j] !== text[shift + j]) {
					break;
				}
			}

			if (j === m) {
				indexes.push(shift);
			}
		}

		// Przesunięcie okna i ponowne obliczenie wartości hash
		if (shift < n - m) {
			textHash = (base * (textHash - text.charCodeAt(shift) * h) + text.charCodeAt(shift + m)) % divisor;
			if (textHash < 0) {
				textHash += divisor;
			}
		}
	}

	shifts.shift();

	return {
		maxStep: maxStep,
		comparisons: comparisons,
		hashComparisons: hashComparisons, // Liczba porównań hash
		indexes: indexes,
		shifts: shifts,
	};
}

function computeLastOccurence(pattern: string, alphabet: string): Map<string, number> {
	const lastOccurence = new Map<string, number>();

	for (const char of alphabet) {
		lastOccurence.set(char, -1);
	}

	for (let i = 0; i < pattern.length; i++) {
		lastOccurence.set(pattern[i], i);
	}

	return lastOccurence;
}

// Algorytm Boyera-Moore'a
export function bm(text: string, pattern: string): stats {
	let maxStep = 0; // Liczba kroków (iteracji pętli)
	let comparisons = 0; // Liczba wykonanych porównań
	const indexes: number[] = []; // Indeksy pełnych dopasowań wzorca
	const shifts: number[] = []; // Przesunięcia do wizualizacji
	const lastOccurrence = computeLastOccurence(pattern, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
	let shift = 0;

	while (shift <= text.length - pattern.length) {
		maxStep++;
		let j = pattern.length - 1;

		while (j >= 0) {
			comparisons++;
			if (pattern[j] === text[shift + j]) {
				j--;
			} else {
				break;
			}
		}

		if (j < 0) {
			indexes.push(shift);
			shift++;
			shifts.push(shift);
		} else {
			let lo = lastOccurrence.get(text[shift + j]);
			if (lo === undefined) {
				lo = -1;
			}
			const shiftIncrement = j - lo > 0 ? j - lo : 1;
			shift += shiftIncrement;
			shifts.push(shift);
		}
	}
	shifts.pop();

	return {
		maxStep: maxStep,
		comparisons: comparisons,
		indexes: indexes,
		shifts: shifts,
		lastoccurence: lastOccurrence,
	};
}
