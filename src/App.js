import React from "react";
import ClickableChecker from "./ClickableChecker";
import { MouseChecker } from "./MouseChecker";

function App() {
  const randomTextList = React.useMemo(() => {
    const textList = [];
    for (let i = 0; i < 100; i++) {
      textList[i] = "test";
    }
    return textList;
  }, []);

  return (
    <MouseChecker>
      <div className="App">
        <h1>Touchpoint</h1>
      </div>
      <ClickableChecker>Testing CLickable Area</ClickableChecker>
      <ClickableChecker>Testing CLickable Area</ClickableChecker>
      {randomTextList.map((text, index) => {
        return <p key={index}>{text}</p>;
      })}
    </MouseChecker>
  );
}

export default App;
