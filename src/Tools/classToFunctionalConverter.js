// TODO:
// * remove state bindnigs (function.bind(this))

import replaceStateModifier from "./replaceStateModifier.js";

export default function (componentString) {
  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    modifyStateRegex: /[^\S\n]*((this.state ?= ?{)|(this.setState\({))([^\S\n]*\n)(([^\S\n]*)([a-zA-Z]\w*): (".*"|[\w*0-9*]*),?[^\S\n]*\n)*.*};?/g,
    setStateRegex: /(?: *this.setState ?\(\s*{ *\n)(( *)([a-z]\w*): (\w*),? *\s*)*};?/,
    setStateVarRegex: /([a-z])(\w*): ([^\s,]*),?/g,
    useStateSetter: /set([a-z])\w*/g,
    initializeMemberVar: /this\.(?!state)((?:\w*|\.)*) ?=/,
    useMemberVar: /this\.(?:state)?.?((?:\w*|\.)*)/g,
    bindFunction: /this.(w*).bind\(this\)/g,
    jsxBindFunction: /(w* ?= ?)this.(w*).bind\(this\)/g
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "$1",
    initializeStateVariableReplacement: "const [$1, set$1] = useState($2);",
    initializeMemberVarReplacement: "let $1",
    bindFunction: "",
    jsxBindFunction: "$1 = $2"
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
      ")"
    );
  };

  const replaceStateModification = function (p1, p2, p3, p4) {
    return "set" + p2.toUpperCase() + p3 + "(" + p4 + ");";
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
  if (matches != null) {
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
  }
  /***
   * MEMBER VAR CONVERSION
   * Convert each initial instance of "this.var =" to "let var =".
   * Every instance of each encountered thereafter converts to "var ="
   ***/

  let initializedVars = [];
  let memberVarSetLine = componentString.match(
    regexPatterns.initializeMemberVar
  );
  let count = 0;
  while (memberVarSetLine != null && count < 100) {
    console.log("memberVarSetLine: " + memberVarSetLine[0]);
    let varName = memberVarSetLine[0].replace(/.*this.(\w*) ?=/, "$1");
    console.log("varname: " + varName);
    console.log("Match? " + componentString.indexOf(memberVarSetLine[0]));
    if (initializedVars.indexOf(varName) === -1) {
      componentString = componentString.replace(
        memberVarSetLine[0],
        "let " + varName + " =",
        1
      );
    } else {
      componentString = componentString.replace(
        memberVarSetLine[0],
        varName + " =",
        1
      );
    }
    initializedVars.push(varName);
    memberVarSetLine = componentString.match(regexPatterns.initializeMemberVar);
    count++;
  }

  // Replace all other instances of member vars
  componentString = componentString.replace(regexPatterns.useMemberVar, "$1");
  /*
  let memberVarSetLines = componentString.match(
    regexPatterns.initializeMemberVar
  );
  console.log("Member var sets: " + memberVarSetLines);
  for (let i = 0; i < memberVarSetLines.length; i++) {
    let varName = componentString.replace("$1");
    console.log("Varname: " + varName);
    if (initializedVars.indexOf(varName) >= 0) {
      //Var is already initialized, so just assign it
      componentString.replace("this." + varName, "let " + varName, 1);
    } else {
      co
      mponentString.replace("this." + varName, "varName", 1);
    }
  }
  */

  return componentString;
}
