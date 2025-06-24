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
	textHashes?: number[];
	patternHash?: number;
};

export function naive(text: string, pattern: string): stats {
	let comparisons = 0;
	let maxStep = 0;
	const indexes: number[] = [];
	const shifts: number[] = [];

	for (let i = 0; i <= text.length - pattern.length; i++) {
		let match = true;
		for (let j = 0; j < pattern.length; j++) {
			comparisons++;
			if (text[i + j] !== pattern[j]) {
				match = false;
				break;
			}
		}
		if (match) {
			indexes.push(i);
		}
		maxStep++;
		shifts.push(maxStep);
	}

	return {
		maxStep,
		comparisons,
		indexes,
		shifts,
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

	const prefixStr = pi.filter(s => s.toString() != "").join(" ");

	return {
		maxStep: maxStep,
		comparisons: comparisons,
		indexes: indexes,
		shifts: shifts,
		prefix: prefixStr, // Teraz zwraca rzeczywiste prefiksy wzorca
	};
}

export function rk(
	text: string,
	pattern: string,
	base: number,
	divisor: number,
): stats & {
	textHashes: number[];
	patternHash: number;
} {
	const n = text.length;
	const m = pattern.length;

	if (m > n) {
		return {
			maxStep: 0,
			comparisons: 0,
			hashComparisons: 0,
			indexes: [],
			shifts: [],
			textHashes: [],
			patternHash: 0,
		};
	}

	let maxStep = 0;
	let comparisons = 0;
	let hashComparisons = 0;
	const indexes: number[] = [];
	const shifts: number[] = [];
	const textHashes: number[] = [];

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
		shifts.push(shift);
		textHashes.push(textHash);
		maxStep++;
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

		if (shift < n - m) {
			textHash = (base * (textHash - text.charCodeAt(shift) * h) + text.charCodeAt(shift + m)) % divisor;
			if (textHash < 0) {
				textHash += divisor;
			}
		}
	}

	shifts.shift();

	return {
		maxStep,
		comparisons,
		hashComparisons,
		indexes,
		shifts,
		textHashes,
		patternHash,
	};
}

function computeLastOccurence(pattern: string, text: string): Map<string, number> {
	const lastOccurence = new Map<string, number>();

	const lettersOnly = text
		.normalize("NFD")
		.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "")
		.toLowerCase()
		.split("");

	// Tworzymy zbiór unikalnych liter
	const uniqueLetters = Array.from(new Set(lettersOnly));

	// Sortujemy litery alfabetycznie
	const alphabet = uniqueLetters.sort((a, b) => a.localeCompare(b));

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
	const lastOccurrence = computeLastOccurence(pattern, text);
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
