/*
 * This is a generic function designed to:
 *   1. Remove the outer container of a code block
 *      Ex: "this.state = {" as well as the closing "}".
 *   2. Apply some standard modification to each line within the block
 *      Ex: "var1: val1" > "setVar1(val1)"
 */

export default function replaceStateModifier(
  str,
  subPatternReplacementFunction
) {
  // First, remove the outer assignment or setState() call and closing bracket
  console.log("str before replace: " + str);
  let regexPattern = /(?:(?:.*|\s*){\s)([\s\S]*)(?:[^\S\n\r]*)(?:s*}[^\S\n\r]*\)?;?\s*)/;
  str = str.replace(regexPattern, "$1");
  console.log("str: " + str);

  // Next, apply the subPatternReplacementFunction to the string
  regexPattern = /([a-z])(\w*): ([^\s,]*),?\n?/g;
  str = str.replace(regexPattern, subPatternReplacementFunction);
  console.log("str after conversion: " + str);
  return str;
}
