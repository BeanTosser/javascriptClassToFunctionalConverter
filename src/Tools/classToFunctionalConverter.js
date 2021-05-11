export default function (componentString) {
  /*
   * Define regex patterns
   *
   * - class def
   * - constructor (essentially remove constructor container declaration
   *   and "super(props)" IF PRESENT)
   * - state initialization
   * - convert "this.setState({var1: value1...varn: valuen});"
   *   with "setVar1(value1);...setVarn(valuen);"
   * - find all lifecycle methods:
   *   -componentDidMount
   *     -useEffect(function(){action}, []);
   *   -componentDidUpdate
   *     -useEffect(function(){action});
   *   -componentDidUpdate (with variable change)
   *     (ie prevprops.prop != props.prop)
   *     -useEffect(function(){action}, [props.prop]);
   *   -componentWillUnmount
   *     -useEffect(function(){return(action)},[]);
   * - Replace instances of "this.state.var" with "var"
   * - remove final "}" (from class def)
   * - export default:
   *   - if it appears at end of file as "export default classname",
   *     remove that line entirely
   *   - otherwise simple leave it as is before the converted class
   *     to functional declaration
   */

  // Position trackers - remember where state was set etc. in order to change programatically later
  let initializeStatePosition, endIntializeStatePosition;

  // REGEX PATTERNS
  const regexPatterns = {
    classDeclarationRegex: /class ((\w*|\d*)+) extends React.Component *{ *\n/gim,
    // blah? remove outer constructor definition block and fix contents indentation accordingly
    constructorRegex: /( *constructor\(props\) *{ *\n)(?: *super\(props\);? *\n)(((?: {2}).*\n)*)/gim,
    initializeStateRegex: /(?: *this.state ?= ?{ *\n)((.+\n+)+?(?= *}))(?: *};? *\n)/gim
  };
  const replacements = {
    classDeclarationReplacement: "function $1(props) {\n",
    constructorReplacement: "$2",
    initializeStateReplacement: "$1"
  };

  componentString = componentString.replace(
    regexPatterns.classDeclarationRegex,
    replacements.classDeclarationReplacement
  );
  componentString = componentString.replace(
    regexPatterns.constructorRegex,
    replacements.constructorReplacement
  );
  componentString = componentString.replace(
    regexPatterns.initializeStateRegex,
    replacements.initializeStateReplacement
  );

  return componentString;
}
