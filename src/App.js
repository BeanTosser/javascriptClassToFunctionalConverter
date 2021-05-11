/*
 * conversion rules
 * - Every statement must be terminated by a semicolon
 * - ALL State variables must be initialized in the constructor
 *   via "state = {};"
 */

import "./styles.css";
import TextEntry from "./Components/TextEntry.js";
import { useState } from "react";
import classToFunctionalConverter from "./Tools/classToFunctionalConverter.js";

export default function App() {
  const [convertedCode, setConvertedCode] = useState("");

  const setText = function (text) {
    setConvertedCode(classToFunctionalConverter(text));
    console.log("converted code: " + convertedCode);
  };

  return (
    <div className="App">
      <TextEntry placeholder="Enter some text" submitText={setText} />
      <textarea className="TextDisplay" disabled value={convertedCode} />
    </div>
  );
}
