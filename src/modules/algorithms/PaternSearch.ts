export type stats = {
  maxStep: number; // liczba kroków \ przesunięć
  comparisons: number; // liczba porównań
  indexes: number[]; // indeksy pierwszego znaku w którym jest dopasowanie
  shifts: number[]; // przesunięcia (o ile przesunąć wzorzec w każdym kroku)

  //for BM
  lastoccurence?: Map<string, number>;
  //for KMP
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
  let suffix: number = 0;
  for (let prefix = 1; prefix < pattern.length; prefix++) {
    while (suffix > 0 && pattern[suffix] != pattern[prefix]) {
      suffix = pi[suffix - 1];
    }
    if (pattern[suffix] == pattern[prefix]) {
      suffix++;
    }
    pi[prefix] = suffix;
  }
  return pi;
}

export function kmp(text: string, pattern: string): stats {
  const indexes: number[] = []; // Indeksy, gdzie zaczyna się pełne dopasowanie.
  const shifts: number[] = []; // Przesunięcia do wizualizacji.
  let maxStep = 0; // Liczba kroków (liczba zarejestrowanych przesunięć).
  const pi = computePrefix(pattern); // Tablica prefiksów wzorca.
  let matches = 0; // Liczba dopasowanych znaków.
  let comparisons = 0; // Liczba porównań.

  // Maksymalne przesunięcie, przy którym wzorzec jest całkowicie widoczny w tekście.
  const maxVisibleShift = text.length - pattern.length;

  maxStep++;
  let lastShift = 0;

  for (let i = 0; i < text.length; i++) {
    // Dopóki mamy dopasowanie, ale aktualny znak nie zgadza się,
    // cofamy liczbę dopasowanych znaków zgodnie z tablicą prefiksów.
    while (matches > 0 && pattern[matches] !== text[i]) {
      comparisons++;
      matches = pi[matches - 1];
      // Nie rejestrujemy przesunięcia tutaj – chcemy tylko jeden krok na iterację.
    }

    comparisons++;
    if (pattern[matches] === text[i]) {
      matches++;
    }

    // Obliczamy bieżące przesunięcie wzorca wg wzoru:
    // currentShift = i - matches + 1.
    const currentShift = i - matches + 1;

    // Rejestrujemy przesunięcie tylko, gdy:
    // 1. Zmieniło się ono w porównaniu z poprzednim krokiem,
    // 2. Jest mniejsze lub równe maxVisibleShift (aby wzorzec nie wyszedł poza tekst),
    // 3. I (opcjonalnie) jest nieujemne.
    if (
      currentShift !== lastShift &&
      currentShift <= maxVisibleShift &&
      currentShift >= 0
    ) {
      shifts.push(currentShift);
      maxStep++;
      lastShift = currentShift;
    }

    // Jeżeli mamy pełne dopasowanie wzorca...
    if (matches === pattern.length) {
      // Zapisujemy indeks początku dopasowania.
      indexes.push(i - pattern.length + 1);
      // Aby móc szukać kolejnych wystąpień, update'ujemy liczbę dopasowanych znaków.
      matches = pi[matches - 1];
    }
  }

  return {
    maxStep: maxStep,
    comparisons: comparisons,
    indexes: indexes,
    shifts: shifts,
  };
}

// Algorytm Rabina-Karpa
export function rk(
  text: string,
  pattern: string,
  base: number,
  divisor: number,
): stats {
  const n = text.length;
  const m = pattern.length;

  // Jeżeli wzorzec jest dłuższy niż tekst, nic do zrobienia
  if (m > n) {
    return { maxStep: 0, comparisons: 0, indexes: [], shifts: [] };
  }

  let maxStep = 0;
  let comparisons = 0;
  const indexes: number[] = [];
  const shifts: number[] = [];

  // Współczynnik do "odwijania" hash (base^(m-1) mod divisor)
  const h = Math.pow(base, m - 1) % divisor;

  // Oblicz hash wzorca oraz pierwszego okna tekstu
  let patternHash = 0;
  let textHash = 0;
  for (let i = 0; i < m; i++) {
    patternHash = (base * patternHash + pattern.charCodeAt(i)) % divisor;
    textHash = (base * textHash + text.charCodeAt(i)) % divisor;
  }

  // Dla każdego przesunięcia od 0 do n-m:
  for (let shift = 0; shift <= n - m; shift++) {
    // 1) rejestrujemy krok wizualizacji
    shifts.push(shift);
    maxStep++;

    // 2) jeśli hashe się zgadzają, porównujemy znak po znaku
    if (patternHash === textHash) {
      let j = 0;
      for (; j < m; j++) {
        comparisons++;
        if (pattern[j] !== text[shift + j]) {
          break;
        }
      }
      // jeżeli wyjście z pętli bez break → pełne dopasowanie
      if (j === m) {
        indexes.push(shift);
      }
    }

    // 3) obliczamy hash kolejnego okna (jeśli istnieje)
    if (shift < n - m) {
      textHash =
        (base * (textHash - text.charCodeAt(shift) * h) +
          text.charCodeAt(shift + m)) %
        divisor;
      if (textHash < 0) {
        textHash += divisor;
      }
    }
  }
  shifts.shift();
  return {
    maxStep: maxStep,
    comparisons: comparisons,
    indexes: indexes,
    shifts: shifts,
  };
}

function computeLastOccurence(
  pattern: string,
  alphabet: string,
): Map<string, number> {
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
  // Budujemy tablicę ostatnich wystąpień dla znaków ze zbioru "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lastOccurrence = computeLastOccurence(
    pattern,
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  );

  let shift = 0;
  //maxStep++;

  while (shift <= text.length - pattern.length) {
    maxStep++;
    let j = pattern.length - 1;

    // Porównujemy znaki zaczynając od prawej strony wzorca
    while (j >= 0) {
      comparisons++;
      if (pattern[j] === text[shift + j]) {
        j--;
      } else {
        break;
      }
    }

    if (j < 0) {
      // Pełne dopasowanie – wzorzec pasuje w pozycji shift
      indexes.push(shift);
      // Dla wyszukiwania wystąpień pozwalających na nachodzenie wzorca, przesuwamy wzorzec o 1
      shift++;
      shifts.push(shift);
    } else {
      // Pobieramy ostatnie wystąpienie znaku z tekstu; jeśli brak, przyjmujemy -1
      let lo = lastOccurrence.get(text[shift + j]);
      if (lo === undefined) {
        lo = -1;
      }
      // Obliczamy przesunięcie wg reguły BM:
      // jeśli (j - lo) > 0 to przesuwamy o (j - lo), w przeciwnym razie o 1.
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
