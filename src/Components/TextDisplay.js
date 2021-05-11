import "../styles.css";

//Text display is a simple disabled textarea
export default function TextDisplay(props) {
  <textarea className="TextDisplay" disabled>
    {props.text}
  </textarea>;
}
