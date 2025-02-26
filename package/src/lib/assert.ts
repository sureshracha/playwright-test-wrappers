import { expect } from "@playwright/test";
import * as context from "./testContext";
import * as logger from './logger';
 
 

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

    export async function hardAssert(actual: any, expected: any, message: string) {
        if (actual === expected) {
            await logger.info(`hardAssert :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        } else {
            await logger.error(`hardAssert :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
           
        }
        expect(actual, `hardAssert :: ${message} \n{Actual : [${actual}] - Expected [${expected}]}`).toEqual(expected);
    }

    export async function hardContains(actual: string, expected: string, message: string) {
        if (actual.includes(expected)) {
            await logger.info(`hardContains :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        } else {
            await logger.error(`hardContains :: ${message} {Actual : [${actual}] - Expected [${expected}]}`);
        }
        expect(actual, `hardContains :: ${message} \n{Actual : [${actual}] - Expected [${expected}]}`).toContain(expected);
    }

    export async function hardNotContains(actual: string, expected: string, message: string) {
        if (!actual.includes(expected)) {
            await logger.info(`hardNotContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
        } else {
            await logger.error(`hardNotContains :: ${message} {String : [${actual}] - Substring [${expected}]}`);
           
        }
        expect(actual, `hardNotContains :: ${message} \n{Actual : [${actual}] - Expected [${expected}]}`).not.toContain(expected);
    }



 
