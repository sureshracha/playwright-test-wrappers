
/**
 * Converts any value to its string representation using JavaScript `toString()`.
 *
 * Behavior:
 * - Works for most primitives and objects that implement `toString()`.
 * - Throws at runtime for `null` or `undefined` because `toString` is not available on those values.
 *
 * @param val Value to convert to string.
 * @returns String representation of the input value.
 *
 * @example
 * // Returns "42"
 * await convertAnyToString(42);
 *
 * @example
 * // Returns "[object Object]" unless object overrides toString
 * await convertAnyToString({ id: 10 });
 */
export async function convertAnyToString(val: any) {
    return val.toString();
}

/**
 * Removes all occurrences of a specific substring/character from a string.
 *
 * Behavior:
 * - If `val` is a `String` and contains `replaceChar`, it removes every match.
 * - If no match is found, it returns the original string.
 *
 * @param val Source string to clean.
 * @param replaceChar Substring or character to remove.
 * @returns Updated string with all matches removed.
 *
 * @example
 * // Returns "abcdef"
 * await replaceAll("abc-def", "-");
 *
 * @example
 * // Returns "20260309"
 * await replaceAll("2026/03/09", "/");
 */
export async function replaceAll(val: string, replaceChar: string) {
    if (val.constructor === String) {
        if (val.includes(replaceChar)) {
            return val.split(replaceChar).join('').toString();
        }
    }
    return val;
}

/**
 * Finds the first row index in a 2D string array that matches all expected values.
 *
 * Matching rules:
 * - `exactMatch = false` (default): case-insensitive partial match (`includes`) per value.
 * - `exactMatch = true`: case-insensitive exact cell match (`===`) per value.
 * - A row is considered a match only if **all** values in `expectedValues` are found.
 *
 * @param sourceArray Input table-like data where each row is a string array.
 * @param expectedValues Values that must be present in the matched row.
 * @param exactMatch Whether to use exact vs partial matching.
 * @returns Zero-based matching row index, or `-1` when not found.
 *
 * @example
 * const rows = [["John", "Manager"], ["Sara", "QA"]];
 * // Returns 1 (partial, case-insensitive)
 * await getIndex(rows, ["sar", "qa"]);
 *
 * @example
 * const rows = [["Open", "High"], ["Closed", "Low"]];
 * // Returns 0 (exact match)
 * await getIndex(rows, ["open", "high"], true);
 */
export async function getIndex(sourceArray: string[][], expectedValues: string[], exactMatch: boolean = false) {
    let row_index = sourceArray.findIndex((row_text) => {
        for (const col_data of expectedValues) {
            if (exactMatch) {
                if (row_text.findIndex((ele: any) => ele.trim().toLowerCase() === col_data.toLowerCase().trim()) < 0) return false;
            }
            else {
                if (row_text.findIndex((ele: any) => ele.trim().toLowerCase().includes(col_data.toLowerCase().trim())) < 0) return false;
            }
        }
        return true;
    });

    if (row_index >= 0) {
        return row_index;
    }
    return -1;
}

/**
 * Converts each word to Title Case (first letter uppercase, remaining letters lowercase).
 *
 * @param str Input text.
 * @returns Title-cased string.
 *
 * @example
 * // Returns "Playwright Wrapper Utilities"
 * await toTitleCase("playWRIGHT wrapper UTILITIES");
 */
export async function toTitleCase(str: string) {
    let words = str.split(' ');
    let titleCase = '';
    for (const word of words) {
        titleCase += word[0].toUpperCase() + word.substr(1).toLowerCase() + ' ';
    }
    return titleCase.trim();
}

/**
 * Converts text to camelCase by removing spaces and capitalizing each subsequent word.
 *
 * @param str Input text.
 * @returns camelCase string.
 *
 * @example
 * // Returns "playwrightTestWrappers"
 * await toCamelCase("Playwright test wrappers");
 */
export async function toCamelCase(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // Skip spaces and separators while building camelCase.
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}
 

