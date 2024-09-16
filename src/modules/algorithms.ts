// algorytm naiwny
type returnValue = {
maxStep: number,
indexes: number[],

}

export function naive(text: string, pattern:string): void
{

}

// Algrytm Knutha-Morrisa-Pratta
export function kmp(text: string, pattern:string): returnValue
{
    let lps: number[] = [];
    LPSarray(pattern, pattern.length, lps);
    let i = 0;
    let j = 0;
    let counter = 0;
    let indexes: number[] = [];
    
    while((text.length-i) >= (pattern.length-j))
    {
        if(pattern[j] === text[i])
        {
            j++;
            i++;
        }
        if(j === pattern.length)
        {
            indexes.push(i-j);
            j = lps[j-1];
        }
        else if(i < text.length && pattern[j] !== text[i])
        {
            if(j !== 0)
            {
                j = lps[j-1];
            }
            else
            {
                i = i+1;
            }
        }
        counter++;
    }
    console.log(indexes)
    return {
        maxStep: counter,
        indexes: indexes
    }
}

// Algorytm Boyera-Moore'a
export function bm(text: string, pattern:string): void
{

}

// Algorytm Rabina-Karpa
export function rp(text: string, pattern:string): void
{

}

function LPSarray(pattern: string, patternLenght: number, lps: number[])
{
    let len = 0;
    lps[0] = 0;
    let i = 1;
    while(i < patternLenght)
    {
        if(pattern[i] === pattern[len])
        {
            len++;
            lps[i] = len;
            i++;
        }
        else
        {
            if(len !== 0)
            {
                len = lps[len-1];
            }
            else
            {
                lps[i] = 0;
                i++;
            }
        }
    }
}