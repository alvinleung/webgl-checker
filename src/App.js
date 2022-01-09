import React from "react";
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
      {randomTextList.map((text) => {
        return <p>{text}</p>;
      })}
    </MouseChecker>
  );
}

export default App;
