# @qe-solutions/playwright-test-wrappers

TypeScript helpers and wrappers built on top of Playwright for UI automation, utility operations, and lightweight test support.

## Features

- `UiElement` wrapper for common browser element actions
- Global `playwrightWrapper` state container for page, context, popup, and logger
- Browser and page helpers (`invokeBrowser`, `gotoUrl`, `waitForPageLoad`, `keyboard`, and more)
- Assertion helpers (`customAssert`)
- String, file, and date utilities
- Database helper (`Db`) for Oracle/MySQL/SQL use cases
- Test context helper (`tcontext`)

## Installation

```bash
npm install @qe-solutions/playwright-test-wrappers
```

## Exports

From `src/index.ts`:

- `export * from './lib/playwright'`
- `export * as customAssert from './lib/assert'`
- `export * as dateUtils from './lib/date.utils'`
- `export * from './lib/db.utils'`
- `export * as fileUtils from './lib/file.utils'`
- `export * as logger from './lib/logger'`
- `export * as stringUtils from './lib/string.utils'`
- `export * as tcontext from './lib/testContext'`
- `export * from './lib/customMethods'`

## Quick Start

```ts
import {
	UiElement,
	invokeBrowser,
	gotoUrl,
	playwrightWrapper,
	waitForPageLoad,
	closeplaywright
} from '@qe-solutions/playwright-test-wrappers';

async function example() {
	playwrightWrapper.browser = await invokeBrowser('chrome', { headless: true });
	playwrightWrapper.context = await playwrightWrapper.browser.newContext();
	playwrightWrapper.page = await playwrightWrapper.context.newPage();

	await gotoUrl('https://example.com');
	await waitForPageLoad();

	const signInButton = new UiElement('button:has-text("Sign in")', {
		description: 'Sign in button'
	});

	await signInButton.click();

	await closeplaywright();
	await playwrightWrapper.context.close();
	await playwrightWrapper.browser.close();
}
```

## UiElement Example

```ts
import { UiElement } from '@qe-solutions/playwright-test-wrappers';

const username = new UiElement('#username', { description: 'Username Input' });
const password = new UiElement('#password', { description: 'Password Input' });
const submit = new UiElement('button[type="submit"]', { description: 'Login Submit' });

await username.setValue('demo.user');
await password.setValue('secret');
await submit.click();
```

## Assertion Utilities

```ts
import { customAssert } from '@qe-solutions/playwright-test-wrappers';

await customAssert.softAssert('SUCCESS', 'SUCCESS', 'Status should match');
await customAssert.softContains('hello world', 'world', 'Message should contain world');
```

## Utility Modules

- `stringUtils`: string conversion, replace, matching index, title/camel case helpers
- `dateUtils`: date range generation, date formatting, age calculation
- `fileUtils`: read/write JSON, check/create folders, list file names
- `Db`: execute select queries and convert results into JSON-friendly structures

## Notes

- `UiElement` methods rely on `playwrightWrapper.page`/`context` being set.
- Auto-heal support can be enabled/disabled with `setAutoHeal(true | false)`.
- Many helper methods are asynchronous and should be awaited.



