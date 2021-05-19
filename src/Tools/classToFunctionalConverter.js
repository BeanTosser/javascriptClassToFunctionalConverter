import replaceStateModifier from "./replaceStateModifier.js";

export default function (componentString) {
  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    modifyStateRegex: /(?: *((this.state ?= ?{)|(this.setState\({)) *\n)((( *)([a-z]\w*): (\w*),? *\s*)*)}\)?;?\n/g,
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

  const replaceStateInitialization = function (p1, p2, p3) {
    console.log("Making a replacement of " + p1 + ", " + p2 + ", " + p3);
    return (
      "const [" +
      p1 +
      p2 +
      ", set" +
      p1.toUpperCase() +
      p2 +
      "] = useState(" +
      p3 +
      ")"
    );
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

  // Store all instances of state modifying blocks in "match"
  let match = componentString.match(regexPatterns.modifyStateRegex);

  console.log("Found the match: " + match);

  // Obtain the substring of each state-modifying block and pass it
  // To the replaceStateModifier function
  let lastMatchEndIndex = 0;
  let componentStringSections = [];
  for (let i = 0; i < match.length; i++) {
    componentStringSections.push(
      componentString.substring(lastMatchEndIndex, match.index)
    );
    let matchRange = [match.index, match.index];

    //inneficient - just keep track of the last "last" index and add to that instead
    for (let j = 0; j < i; j++) {
      matchRange[0] += match[j].length;
    }
    console.log("match size: " + match.length);
    console.log("current match index: " + i);
    console.log("Current match: " + match[i]);
    console.log("------");

    matchRange[1] = matchRange[0] + match[i].length;
    lastMatchEndIndex = matchRange[1];

    let modifiedBlock = replaceStateModifier(
      componentString.substring(matchRange[0], matchRange[1]),
      replaceStateInitialization
    );
    componentStringSections.push(modifiedBlock);
  }
  componentStringSections.push(componentString.substring(lastMatchEndIndex));
  componentString = componentStringSections;
  return componentString;
}
