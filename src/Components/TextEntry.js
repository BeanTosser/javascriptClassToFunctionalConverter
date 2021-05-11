import { useState } from "react";

import "../styles.css";

export default function TextEntry(props) {
  const [text, setText] = useState("");

  const submitText = function () {
    console.log("Submitting text: " + text);
    props.submitText(text);
  };

  const handleTextChange = function (e) {
    setText(e.target.value);
    console.log("Setting text to " + e.target.value);
  };

  return (
    <div>
      <textarea
        className="TextDisplay"
        placeholder={props.placeholder}
        value={text}
        onChange={handleTextChange}
      />
      <button onClick={submitText}>Submit</button>
    </div>
  );
}
