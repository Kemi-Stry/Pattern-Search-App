import questions from "../assets/questions.json";
import Score from "../components/score/Score";
import { useState } from "react";

const TestPage = () => {
  const [finish, setFinish] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let element: HTMLInputElement;
    const answers: string[] = [];
    const correctAnswers: string[] = [];
    let score = 0;

    //get answers from form
    for (let i = 0; i < questions.length * 4; i++) {
      element = document.getElementById("radio" + i) as HTMLInputElement;
      if (element.checked) {
        answers.push(element.value);
      }
    }

    //get correct asnwers
    for (let i = 0; i < questions.length; i++) {
      correctAnswers.push(questions[i].correct);
    }

    //check answers
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === correctAnswers[i]) {
        score = score + 1;
      }
    }

    setScore(score);
    setFinish(true);
  }

  if (finish) {
    return <Score score={score} total={questions.length} />;
  }

  let index: number = 0;
  return (
    <div className="content">
      <h1>Test Page</h1>
      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div className="card" key={index}>
            <h2>{question.title}</h2>
            <div className="answers">
              <input
                type="radio"
                name={question.id}
                id={"radio" + index}
                value={"a"}
              />
              <label htmlFor={"radio" + index++}>{question.answerA}</label>
            </div>
            <div className="answer">
              <input
                type="radio"
                name={question.id}
                id={"radio" + index}
                value={"b"}
              />
              <label htmlFor={"radio" + index++}>{question.answerB}</label>
            </div>
            <div className="answer">
              <input
                type="radio"
                name={question.id}
                id={"radio" + index}
                value={"c"}
              />
              <label htmlFor={"radio" + index++}>{question.answerC}</label>
            </div>
            <div className="answer">
              <input
                type="radio"
                name={question.id}
                id={"radio" + index}
                value={"d"}
              />
              <label htmlFor={"radio" + index++}>{question.answerD}</label>
            </div>
          </div>
        ))}
        <input type="submit" value="Zakończ" />
      </form>
    </div>
  );
};

export default TestPage;
