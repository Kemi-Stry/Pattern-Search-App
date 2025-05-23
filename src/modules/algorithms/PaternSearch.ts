export type stats = {
    maxStep: number    // liczba kroków \ przesunięć
    comparisons: number // liczba porównań
    indexes: number[] // indeksy pierwszego znaku w którym jest dopasowanie
    shifts: number[] // przesunięcia (o ile przesunąć wzorzec w każdym kroku)
}

//Algorytm naiwny
export function naive(text: string, pattern:string): stats
{
    let maxStep = 0;
    let commparisons = 0;
    const indexes: number[] = [];
    const shifts: number[] = [];
    for (let i= 0; i <= text.length - pattern.length; i++)
    {

        commparisons++;
        if(pattern === text.substring(i, i + pattern.length))
        {
            indexes.push(i);
            commparisons += pattern.length - 1
        }
        maxStep++;
        shifts.push(maxStep);
    }
    shifts.pop();
    return {
        maxStep: maxStep,
        comparisons: commparisons,
        indexes: indexes,
        shifts: shifts
    };
}

function computePrefix(pattern: string): number[]
{
    const pi = new Array(pattern.length).fill(0);
    let suffix: number = 0;
    for (let prefix = 1; prefix < pattern.length; prefix++)
    {
        while (suffix > 0 && pattern[suffix] != pattern[prefix])
        {
            suffix = pi[suffix - 1];
        }
        if (pattern[suffix] == pattern[prefix])
        {
            suffix++;
        }
        pi[prefix] = suffix;
    }
    return pi;
}

// Algorytm Knutha-Morrisa-Pratta
export function kmp(text: string, pattern: string): stats
{
    const indexes: number[] = []
    const shifts: number[] = [];
    let maxStep = 0;
    const pi = computePrefix(pattern);
    let matches = 0;
    for (let i=0; i<text.length; i++)
    {
        maxStep++;
        while(matches>0 && pattern[matches] !== text[i])
        {
            matches = pi[matches-1];
            console.log(matches);
            shifts.push(matches);
        }
        if(pattern[matches] === text[i])
        {
            matches++;
        }
        if (matches === pattern.length)
        {
            indexes.push(i-pattern.length+1);
            matches = pi[matches-1];
        }
    }
    return {
        maxStep: maxStep,
        indexes: indexes,
        shifts: shifts
    };
}


// Algorytm Rabina-Karpa
export function rk(text: string, pattern: string, base: number, divisor: number): stats
{
    let maxStep = 0;
    const indexes: number[] = [];
    const shifts: number[] = [];
    const h = Math.pow(base, pattern.length-1) % divisor;
    let patternHash = 0;
    let textHash = 0;

    for (let i=0; i<pattern.length; i++)
    {
        patternHash = (base*patternHash+pattern[i].charCodeAt(0)) % divisor;
        textHash = (base*textHash+text[i].charCodeAt(0)) % divisor;
    }

    for (let shift=0; shift<=text.length-pattern.length; shift++)
    {
        maxStep++;
        //shifts.push(shift+1);

        if(patternHash == textHash)
        {
            if(text.substring(shift, pattern.length+shift) == pattern)
            {
                indexes.push(shift);
                shifts.push(shift)
            }
        }
        if (shift < text.length - pattern.length)
        {
            textHash = (base * (textHash - text[shift].charCodeAt(0) * h) + text[shift + pattern.length].charCodeAt(0)) % divisor;
            if (textHash < 0)
            {
                textHash = textHash + divisor;
            }
        }
    }
    return {
        maxStep: maxStep,
        indexes: indexes,
        shifts: shifts
    };
}

function computeLastOccurence(pattern: string, alphabet: string): Map<string, number>
{
    const lastOccurence = new Map<string, number>;

    for (const char of alphabet)
    {
        lastOccurence.set(char, -1);
    }

    for(let i=0; i<pattern.length; i++)
    {
        lastOccurence.set(pattern[i], i);
    }

    return lastOccurence;
}

// Algorytm Boyera-Moore'a
export function bm(text: string, pattern: string): stats
{
    let maxStep = 0;
    const indexes: number[] = [];
    const shifts: number[] = [];
    const lastOccurrence = computeLastOccurence(pattern, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    let shift = 0;
    
    while (shift <= text.length - pattern.length)
    {
        maxStep++;
        let j = pattern.length - 1;
        while (j >= 0 && pattern[j] === text[shift + j])
        {
            j--;
        }
        if (j < 0)
        {
            indexes.push(shift);
            shift++;
        }
        else
        {
            shift += (j - (lastOccurrence.get(text[shift + j]) ?? -1)) > 0 ? j - (lastOccurrence.get(text[shift + j]) ?? -1) : 1;
            shifts.push(shift);
        }
        
    }
    return {
        maxStep: maxStep,
        indexes: indexes,
        shifts: shifts
    };
}