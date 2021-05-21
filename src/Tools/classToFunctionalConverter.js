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
    useStateSetter: /set([a-z])\w*/g,
    initializeMemberVar: /this\.(?!state)(\w*) ?=/g
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "$1",
    initializeStateVariableReplacement: "const [$1, set$1] = useState($2);",
    initializeMemberVarReplacement: "let $1"
  };

  const replaceStateInitialization = function (p1, p2, p3, p4) {
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

  const replaceStateModification = function (p1, p2, p3, p4) {
    return "set" + p2.toUpperCase() + p3 + "(" + p4 + ");" + "\n";
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
  // Obtain the substring of each state-modifying block and pass it
  // To the replaceStateModifier function
  let lastMatchEndIndex = 0;
  let componentStringSections = []; // used to build the final code string piece-by-piece
  for (let i = 0; i < matches.length; i++) {
    let matchStartPosition = componentString.indexOf(matches[i]);
    let matchEndPosition = matchStartPosition + matches[i].length;

    console.log("current match: " + matches[i]);

    // Determine whether this block _initializes_ or _modifies_ state
    let isInitializer = matches[i].search(/this.state ?=/) !== -1;

    /*
     * Add all the code between the end of the last matched (state-setting) section
     * (or the beginning of the code) and the current one
     */
    console.log(
      "Adding 'inbetween' section to componentStringSections: " +
        componentString.substring(lastMatchEndIndex, matchStartPosition)
    );
    componentStringSections.push(
      componentString.substring(lastMatchEndIndex, matchStartPosition)
    );

    lastMatchEndIndex = matchEndPosition;

    let func;
    if (isInitializer) {
      func = replaceStateInitialization;
    } else {
      func = replaceStateModification;
    }

    let modifiedBlock = replaceStateModifier(matches[i], func);
    console.log("modified block: " + modifiedBlock);
    componentStringSections.push(modifiedBlock); //Add the modified state-setting block to the final string
  }

  // Insert the remaining unmodified code into the final assembled code string
  componentStringSections.push(componentString.substring(lastMatchEndIndex));
  componentString = componentStringSections.join("");

  /***
   * MEMBER VAR CONVERSION
   * Convert each initial instance of "this.var =" to "let var =".
   * Every instance of each encountered thereafter converts to "var ="
   ***/

  let initializedVars = [];
  let memberVarSetLines = componentString.matchAll(regexPatterns.initializeMemberVar);
  for(let i = 0; i < memberVarSetLines.length; i++){
    let isInitialized = true;
    let varName = memberVarSetLines[i].replace("$1");
    if (initializedVars.indexOf(varName) >= 0){
      //Var is already initialized, so just assign it
      componentString.replace(new RegExp('', 'g'))
    }
    for(let j = 0; j < initializedVars.length; j++){
      if(initializedVars)
    }
  }

  return componentString;
}
