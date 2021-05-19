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

  const replaceStateInitialization = function (p1, p2, p3, p4) {
    console.log("Making a replacement of " + p2 + ", " + p3 + ", " + p4);
    return (
      "const [" +
      p2 +
      p3 +
      ", set" +
      p2.toUpperCase() +
      p3 +
      "] = useState(" +
      p4 +
      ")\n"
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
  let matches = componentString.match(regexPatterns.modifyStateRegex);
  console.log("---");
  console.log("Matches: " + matches);
  console.log("---");
  console.log("");
  // Obtain the substring of each state-modifying block and pass it
  // To the replaceStateModifier function
  let lastMatchEndIndex = 0;
  let componentStringSections = [];
  for (let i = 0; i < matches.length; i++) {
    componentStringSections.push(
      componentString.substring(lastMatchEndIndex, matches[i].index)
    );
    let matchRange = [
      matches[i].index,
      matches[i].index + matches[i][0].length
    ];

    lastMatchEndIndex = matchRange[1];

    let modifiedBlock = replaceStateModifier(
      matches[i],
      replaceStateInitialization
    );
    console.log("Modified block: " + modifiedBlock);
    componentStringSections.push(modifiedBlock);
  }
  componentStringSections.push(componentString.substring(lastMatchEndIndex));
  componentString = componentStringSections;
  return componentString;
}
