import replaceStateModifier from "./replaceStateModifier.js";

export default function (componentString) {
  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    initializeStateRegex: /(?: *this.state ?= ?{ *\n)((( *)([a-z]\w*): (\w*),? *\s*)*)};?\n/,
    setStateRegex: /(?: *this.setState ?\(\s*{ *\n)(( *)([a-z]\w*): (\w*),? *\s*)*};?/,
    setStateVarRegex: /([a-z])(\w*): ([^\s,]*),?/g,
    useStateSetter: /set([a-z])\w*/g
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "$1",
    initializeStateVariableReplacement: "const [$1, set$1] = useState($2);"
  };

  //Replace class definition with function definition
  componentString = componentString.replace(
    regexPatterns.classDeclarationRegex,
    replacements.classDeclarationReplacement
  );
  // Remove constructor declaration and its closing "}"
  componentString = componentString.replace(
    regexPatterns.constructorRegex,
    replacements.constructorReplacement
  );

  //***
  // Find position in the code where state is initialized (denoted by "this.state =")
  //***
  let initializeStateRegexMatch = componentString.match(
    regexPatterns.initializeStateRegex
  );
  let initializeStateRange = [
    initializeStateRegexMatch.index,
    initializeStateRegexMatch.index + initializeStateRegexMatch[0].length
  ];

  // If state initialization exists
  if (initializeStateRange[0] >= 0) {
    // Create a copy of the string, omitting everything _before and after_ state initialization
    // just in case the code sets any other object values before the state initialization
    let stateInitializationCode = componentString.slice(
      initializeStateRange[0],
      initializeStateRange[1]
    );

    // Remove state = assignement and corresponding closing bracket
    stateInitializationCode = stateInitializationCode.replace(
      regexPatterns.initializeStateRegex,
      replacements.initializeStateReplacement
    );

    // Replace state variable declarations with useState() declarations
    stateInitializationCode = stateInitializationCode.replace(
      regexPatterns.setStateVarRegex,
      function (p1, p2, p3, p4) {
        console.log(
          "Making a replacement: " +
            "const [" +
            p1 +
            ", set" +
            p2 +
            p3 +
            "] = useState(p4);"
        );
        return (
          "const [" +
          p2 +
          p3 +
          ", set" +
          p2.toUpperCase() +
          p3 +
          "] = useState(" +
          p4 +
          ")"
        );
      }
    );

    // COncat everything before the state initializatin position and the newly modified code
    // and put it back into componentString
    componentString =
      componentString.slice(0, initializeStateRange[0]) +
      stateInitializationCode +
      componentString.slice(
        initializeStateRange[1] + 1,
        componentString.length
      );
  }

  return componentString;
}
