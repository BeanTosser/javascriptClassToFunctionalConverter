export default function (componentString) {
  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    initializeStateRegex: /(?: *this.state ?= ?{ *\n)((.+\n+)+?(?= *}))(?: *};? *\n)/gim,
    setStateVarRegex: /([a-z]\w*): ([^\s,]*)/g,
    useStateSetter: /set([a-z])\w*/g
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "const [$1, set$1] = useState($2);\n"
  };

  componentString = componentString.replace(
    regexPatterns.classDeclarationRegex,
    replacements.classDeclarationReplacement
  );
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
    initializeStateRegexMatch.index + initializeStateRegexMatch.length
  ];

  // If state initialization exists
  if (initializeStateRange[0] >= 0) {
    console.log("replacing state initialization...");
    // Create a copy of the string omitting everything _before_ state initialization
    // just in case the code sets any other object values before the state initialization
    let stateInitializationCode = componentString.slice(
      initializeStateRange[0],
      initializeStateRange[1]
    );
    let match = regexPatterns.setStateVarRegex.exec(stateInitializationCode);
    console.log("Match: " + match);
    for (let i = 0; i < match.length; i++) {
      stateInitializationCode = stateInitializationCode.replace(
        regexPatterns.setStateVarRegex,
        replacements.initializeStateReplacement
      );
    }
    console.log(
      "code after replacing state var decs: " + stateInitializationCode
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

    /*
    match = regexPatterns.useStateSetter.exec(stateInitializationCode);
    for (let i = 0; i < match.length; i++) {
      console.log("match[i]: " + match[i]);
      let matchIndex = match[i].index;
      console.log("matchIndex: " + matchIndex);
      // matchIndex is the index of the word "set" in "setvarName".
      // In this case, we need to replace the lowercase "v" with a "V",
      // which appears 3 characters after the match position.
      let character = stateInitializationCode.charAt(matchIndex);
      console.log("Char: " + character);
      character = character.toUpperCase();
      console.log("Upper char: " + character);
      stateInitializationCode =
        stateInitializationCode.substring(0, matchIndex) +
        character +
        stateInitializationCode.substring(
          matchIndex,
          stateInitializationCode.length
        );
    }
    */
    // COncat everything before the state initializatin position and the newly modified code
    // and put it back into componentString
    componentString =
      componentString.slice(0, initializeStateRange[0]) +
      stateInitializationCode +
      componentString.slice(
        initializeStateRange[1] + 1,
        stateInitializationCode.length
      );
  }
  /*
  componentString = componentString.replace(
    regexPatterns.initializeStateRegex,
    replacements.initializeStateReplacement
  );
*/
  return componentString;
}
