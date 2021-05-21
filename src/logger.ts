import _debug from "debug";
import prettyFormat from "pretty-format";
import { PLUGIN_IDENTIFIER } from "./constants";

const prettyFormatOptions: Parameters<typeof prettyFormat>[1] = {
  highlight: true,
};
const namespacedDebug = _debug(PLUGIN_IDENTIFIER);

// Tagged template literal for debug logs
export const debug: (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => void = Object.assign(function (strings: string[], ...values: unknown[]) {
  let builtString = "";

  if (values.length === 0) {
    builtString = strings[0];
  } else {
    let currentValueIndex = 0;
    for (const [index, string] of strings.entries()) {
      if (string.length === 0) break;
      builtString += string;

      builtString += prettyFormat(
        values[currentValueIndex],
        prettyFormatOptions
      );
      currentValueIndex = index;
    }

    for (const value of values.slice(currentValueIndex + 1)) {
      builtString += prettyFormat(value, prettyFormatOptions);
    }
  }

  return namespacedDebug(builtString);
}, namespacedDebug);
