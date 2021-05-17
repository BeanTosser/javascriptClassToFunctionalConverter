/*
 * This is a generic function designed to:
 *   1. Remove the outer container of a code block
 *      Ex: "this.state = {" as well as the closing "}".
 *   2. Apply some standard modification to each line within the block
 *      Ex: "var1: val1" > "setVar1(val1)"
 */

export default function replaceStateModifier(
  str,
  pattern,
  subPattern,
  patternReplacement,
  subPatternReplacementFunction
) {
  //***
  // Find position ins the code where state is initialized (denoted by "this.state =")
  //***
  let codeBlockRegexMatch = str.match(pattern);
  let codeBlockRange = [
    codeBlockRegexMatch.index,
    codeBlockRegexMatch.index + codeBlockRegexMatch[0].length
  ];

  // If state initialization exists
  if (codeBlockRange[0] >= 0) {
    // Create a copy of the string, omitting everything _before and after_ state initialization
    // just in case the code sets any other object values before the state initialization
    let codeBlockString = str.slice(codeBlockRange[0], codeBlockRange[1]);

    // Remove state = assignement and corresponding closing bracket
    codeBlockString = codeBlockString.replace(pattern, patternReplacement);

    // Replace state variable declarations with useState() declarations
    codeBlockString = codeBlockString.replace(
      subPattern,
      subPatternReplacementFunction
    );

    // COncat everything before the state initializatin position and the newly modified code
    // and put it back into str
    str =
      str.slice(0, codeBlockRange[0]) +
      codeBlockString +
      str.slice(codeBlockRange[1] + 1, str.length);

    return str;
  }
}
