export default function (componentString) {
  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    initializeStateRegex: /(?: *this.state ?={ *\n)(( *)([a-z]\w*): (\w*),? *\s*)*};?/,
    setStateRegex: /(?: *this.setState ?\(\s*{ *\n)(( *)([a-z]\w*): (\w*),? *\s*)*};?/,
    setStateVarRegex: /([a-z])(\w*): ([^\s,]*),?/g,
    useStateSetter: /set([a-z])\w*/g
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "const [$1, set$1] = useState($2);"
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

  // Find position in the code where state is initialized (denoted by "this.state =")
  let initializeStateRegexMatch = componentString.match(
    regexPatterns.initializeStateRegex
  );
  let initializeStateRange = [
    initializeStateRegexMatch.index,
    initializeStateRegexMatch.index + initializeStateRegexMatch[0].length
  ];

  console.log("Match range: " + initializeStateRange);
  console.log(
    "string in this range: " +
      componentString.substring(
        initializeStateRange[0],
        initializeStateRange[1]
      )
  );

  // If state initialization exists
  if (initializeStateRange[0] >= 0) {
    console.log("replacing state initialization...");
    // Create a copy of the string omitting everything _before_ state initialization
    // just in case the code sets any other object values before the state initialization
    let stateInitializationCode = componentString.slice(
      initializeStateRange[0],
      initializeStateRange[1]
    );

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

    // The first letter of the var name should be Uppercase in the
    // setter function name for proper camel casing
    let useStatePosition = stateInitializationCode.search(
      regexPatterns.useStateSetter
    );
    let character;
    let counter = 0;
    while (useStatePosition >= 0) {
      character = stateInitializationCode.charAt(useStatePosition + 3);
      character = character.toUpperCase();
      stateInitializationCode =
        stateInitializationCode.substring(0, useStatePosition + 3) +
        character +
        stateInitializationCode.substring(
          useStatePosition + 4,
          stateInitializationCode.length
        );
      counter++;
      if (counter > 500) break; // Safety feature to prevent infinite looping in case of unusually-formatted code
      useStatePosition = stateInitializationCode.search(
        regexPatterns.useStateSetter
      );
    }
    console.log(
      "stateInitializationCode when all's said and done: " +
        stateInitializationCode
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

  const replaceStateModifier = function (
    blockRegex,
    blockReplacement,
    lineRegex,
    lineReplacement
  ) {};

  /*
   * Now do the same general thing as above for every setState() call
   * note that instead of declaring the useState vars and setters,
   * you are just replacing "var: value" with "setVar(value)"
   */

  return componentString;
}
