export default function (componentString) {
  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    initializeStateRegex: /(?: *this.state ?= ?{ *\n)((.+\n+)+?(?= *}))(?: *};? *\n)/gim,
    setStateVarRegex: /( *)(\S*)?(?=:): (\S*)(?=,)? *\n?/g
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "$1const [$2, set$2] = useState($3);\n"
  };
  /*
  componentString = componentString.replace(
    regexPatterns.classDeclarationRegex,
    replacements.classDeclarationReplacement
  );
  componentString = componentString.replace(
    regexPatterns.constructorRegex,
    replacements.constructorReplacement
  );
*/
  console.log("Searching for state initialization...");
  // Find position in the code where state is initialized (denoted by "this.state =")
  let initializeStatePosition = componentString.search(
    regexPatterns.initializeStateRegex
  );
  console.log(
    "state is initialized at string position: " + initializeStatePosition
  );
  // If state initialization exists
  if (initializeStatePosition >= 0) {
    console.log("replacing state initialization...");
    // Create a copy of the string omitting everything _before_ state initialization
    // just in case the code sets any other object values before the state initialization
    let codeFromStateInitialization = componentString.slice(
      initializeStatePosition,
      componentString.length
    );
    let match = regexPatterns.setStateVarRegex.exec(
      codeFromStateInitialization
    );
    console.log("Match: " + match);
    for (let i = 0; i < match.length; i++) {
      codeFromStateInitialization = codeFromStateInitialization.replace(
        regexPatterns.setStateVarRegex,
        replacements.initializeStateReplacement
      );
    }
    // COncat everything before the state initializatin position and the newly modified code
    // and put it back into componentString
    componentString =
      componentString.slice(0, initializeStatePosition) +
      codeFromStateInitialization;
  }
  /*
  componentString = componentString.replace(
    regexPatterns.initializeStateRegex,
    replacements.initializeStateReplacement
  );
*/
  return componentString;
}
