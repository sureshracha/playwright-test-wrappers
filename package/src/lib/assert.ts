import { expect } from "@playwright/test";
import * as context from "./testContext";
import * as logger from './logger';
 
 

    /**
     * Performs a soft equality assertion.
     *
     * Details:
     * - Compares `actual` and `expected`.
     * - Optionally normalizes string values to lower case for case-insensitive comparison.
     * - Logs pass/fail and stores failures in `testContext.assertsJson.soft` without throwing.
     *
     * @param actual Actual value from the test flow.
     * @param expected Expected value.
     * @param message Custom assertion message for logs and reports.
     * @param caseSensitive Set `true` to compare strings with case sensitivity.
     *
     * @example
     * await softAssert(statusText, "Success", "Status text validation");
     */
    export async function softAssert(actual: any, expected: any, message: string, caseSensitive: boolean = false) {
        if (typeof (actual) === 'string' && typeof (expected) === 'string') {
            actual = caseSensitive ? actual.trim() : actual.toLowerCase().trim();
            expected = caseSensitive ? expected.trim() : expected.toLowerCase().trim();
        }
        if (actual === expected) {
            await logger.info(`softAssert :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        } else {
            await logger.error(`softAssert :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softAssert: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, Expected: `${expected}`, message: `${message}` });
        }
    }

    /**
     * Performs a soft substring assertion.
     *
     * Details:
     * - Verifies whether `actual` contains `expected`.
     * - Supports optional case-sensitive comparison for string inputs.
     * - Logs and records failure without failing the test immediately.
     *
     * @example
     * await softContains(pageTitle, "dashboard", "Page title should include dashboard");
     */
    export async function softContains(actual: any, expected: any, message: string, caseSensitive: boolean = false) {
        if (typeof (actual) === 'string' && typeof (expected) === 'string') {
            actual = caseSensitive ? actual.trim() : actual.toLowerCase().trim();
            expected = caseSensitive ? expected.trim() : expected.toLowerCase().trim();
        }
        if (actual.includes(expected)) {
            await logger.info(`softContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
        } else {
            await logger.error(`softContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softContains: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, Expected: `${expected}`, message: `${message}` });
        }
    }

    /**
     * Performs a soft negative substring assertion.
     *
     * Details:
     * - Verifies that `actual` does not contain `expected`.
     * - Records the failure in soft assertions when the value is found.
     *
     * @example
     * await softNotContains(errorBanner, "fatal", "Fatal error should not be shown");
     */
    export async function softNotContains(actual: any, expected: any, message: string, caseSensitive: boolean = false) {
        actual = caseSensitive ? actual.trim() : actual.toLowerCase().trim();
        expected = caseSensitive ? expected.trim() : expected.toLowerCase().trim();
        if (!actual.includes(expected)) {
            await logger.info(`softNotContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
        } else {
            await logger.error(`softNotContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softNotContains: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, Expected: `${expected}`, message: `${message}` });
        }
    }

    /**
     * Performs a soft assertion to verify a string array contains a value.
     *
     * Details:
     * - Useful for validating table row values, tag lists, and dropdown data.
     * - Supports case-sensitive or case-insensitive behavior.
     *
     * @example
     * await softContainsForStringArray(["Open", "Closed"], "open", "Status should exist");
     */
    export async function softContainsForStringArray(actual: string[], expected: any, message: string, caseSensitive: boolean = false) {
        actual = caseSensitive ? actual : actual.toString().toLowerCase().split(',');
        expected = caseSensitive ? expected.trim() : expected.toLowerCase().trim();
        if (actual.indexOf(expected) >= 0) {
            await logger.info(`softContainsForStringArray :: ${message} {Array : [${actual}] - Element [${expected}]}`);
        } else {
            await logger.error(`softContainsForStringArray :: ${message} {Array : [${actual}] - Element [${expected}]}`);
            
            context.testContext.assertsJson.soft.push({ softContainsForStringArray: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, Expected: `${expected}`, message: `${message}` })
        }
    }
    /**
     * Performs a soft assertion to verify a string array does not contain a value.
     *
     * @example
     * await softNotContainsForStringArray(["Admin", "User"], "Guest", "Guest role should not exist");
     */
    export async function softNotContainsForStringArray(actual: string[], expected: any, message: string, caseSensitive: boolean = false) {
        actual = caseSensitive ? actual : actual.toString().toLowerCase().split(',');
        expected = caseSensitive ? expected.trim() : expected.toLowerCase().trim();
        if (actual.indexOf(expected) < 0) {
            await logger.info(`softNotContainsForStringArray :: ${message} {Array : [${actual}] - Element [${expected}]}`);
        } else {
            await logger.error(`softNotContainsForStringArray :: ${message} {Array : [${actual}] - Element [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softContainsForStringArray: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, Expected: `${expected}`, message: `${message}` })
        }
    }

    /**
     * Performs a soft comparison between two string arrays.
     *
     * Details:
     * - Marks failure when items from `actual` are missing in `expected`.
     * - Adds mismatch values to the soft assertion payload.
     *
     * @example
     * await softAssertCompareStringArrays(actualColumns, expectedColumns, "Column validation");
     */
    export async function softAssertCompareStringArrays(actual: string[], expected: string[], message: string, caseSensitive: boolean = false) {
        let diffVals = actual.filter(item => expected.indexOf(item) < 0);
        let count = diffVals.length;
        let flag = (count === 0);
        if (flag) {
            await logger.info(`softAssertCompareArrays :: ${message} {Actual : [${actual}] - Expected  [${expected}]}`);
        } else {
            await logger.error(`softAssertCompareArrays :: ${message} {Actual : [${actual}] - Expected  [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softAssertCompareArrays: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, Expected: `${expected}`, message: `${message}`, differnce: `[${diffVals}]` });
        }
    }

    /**
     * Performs a soft assertion that `actual` contains at least one value from `expected`.
     *
     * @example
     * await softContainsOneOfThem(message, ["saved", "updated"], "Success text should be present");
     */
    export async function softContainsOneOfThem(actual: any, expected: string[], message: string, caseSensitive: boolean = false) {
        actual = caseSensitive ? actual.trim() : actual.toLowerCase().trim();
        expected = caseSensitive ? expected : expected.toString().toLowerCase().split(',');;
        let flag = false;
        for (const element of expected) {
            if (actual.includes(element.trim())) flag = true;
        }
        if (flag) {
            await logger.info(`softContainsOneOfThem :: ${message} {Actual : [${actual}] - Expected One of Them [${expected}]}`);
        } else {
            await logger.error(`softContainsOneOfThem :: ${message} {Actual : [${actual}] - Expected One of Them [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softContainsOneOfThem: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, ExpectedOneofThem: `${expected}`, message: `${message}` });
        }
    }

    /**
     * Performs a soft assertion that `actual` contains none of the values from `expected`.
     *
     * @example
     * await softNotContainsOneOfThem(alertText, ["error", "failed"], "Failure keywords should not appear");
     */
    export async function softNotContainsOneOfThem(actual: any, expected: string[], message: string, caseSensitive: boolean = false) {
        actual = caseSensitive ? actual.trim() : actual.toLowerCase().trim();
        expected = caseSensitive ? expected : expected.toString().toLowerCase().split(',');;
        let flag = false;
        for (const element of expected) {
            if (actual.includes(element.trim())) {
                flag = true;
            }
        }
        if (flag) {
            await logger.error(`softNotContainsOneOfThem :: ${message} {Actual : [${actual}] - Expected One of Them [${expected}]}`);
            context.testContext.assertsJson.soft.push({ softContainsOneOfThem: "Failed", caseSensitive: `${caseSensitive}`, Actual: `${actual}`, ExpectedOneofThem: `${expected}`, message: `${message}` });
        } else {
            await logger.info(`softNotContainsOneOfThem :: ${message} {Actual : [${actual}] - Expected One of Them [${expected}]}`);

        }
    }

    /**
     * Performs a hard equality assertion using Playwright `expect`.
     *
     * Details:
     * - Logs result.
     * - Throws on mismatch and fails the test immediately.
     *
     * @example
     * await hardAssert(response.status(), 200, "API status code check");
     */
    export async function hardAssert(actual: any, expected: any, message: string) {
        if (actual === expected) {
            await logger.info(`hardAssert :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        } else {
            await logger.error(`hardAssert :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
           
        }
        expect(actual, `hardAssert :: ${message} \n{Actual : [${actual}] - Expected [${expected}]}`).toEqual(expected);
    }

    /**
     * Performs a hard substring assertion using Playwright `expect(...).toContain(...)`.
     *
     * @example
     * await hardContains(orderSummary, "Order Confirmed", "Order confirmation text check");
     */
    export async function hardContains(actual: string, expected: string, message: string) {
        if (actual.includes(expected)) {
            await logger.info(`hardContains :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        } else {
            await logger.error(`hardContains :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        }
        expect(actual, `hardContains :: ${message} \n{Actual : [${actual}] - Expected [${expected}]}`).toContain(expected);
    }

    /**
     * Performs a hard negative substring assertion.
     *
     * @example
     * await hardNotContains(pageContent, "Access Denied", "Restricted text should not appear");
     */
    export async function hardNotContains(actual: string, expected: string, message: string) {
        if (!actual.includes(expected)) {
            await logger.info(`hardNotContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
        } else {
            await logger.error(`hardNotContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
           
        }
        expect(actual, `hardNotContains :: ${message} \n{Actual : [${actual}] - Expected [${expected}]}`).not.toContain(expected);
    }



 
