interface ScoreProps {
    score: number
    total: number
}

const Score = (props: ScoreProps) => {
    return(
        <>
        <h1>Twój wynik: {props.score}/{props.total}</h1>
        <h1>{Math.floor((props.score/props.total)*100)}%</h1>
        </>
        
    )      
}

export default Score;
