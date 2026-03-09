import { Page, APIRequestContext, BrowserContext, Browser, chromium, firefox, webkit, Locator, FrameLocator } from "@playwright/test";
import { customLogger } from '@qe-solutions/test-automation-library';
import { cssPath, xPath } from "playwright-dompath";


export class UiElement {

    protected locator: string;
    protected page!: Page;
    protected objectDescriptor: string;
    protected isPopupExist: boolean;
    protected pageIndex: number;
    protected fullCss: string;
    protected fullXpath: string = '';
    protected tempLocator!: Locator;
    protected tempLocators: Locator[] = [];
    protected hasFrame: boolean;
    protected frameLocator!: FrameLocator;
    protected stringFramelocator: string;
    //description: string = "Object - ", isPopup: boolean = false, pageIndex: number = 0

    constructor(locator: string, options?: { description?: string, isPopup?: boolean, pageIndex?: number, frameLocator?: string }) {
        this.locator = locator;
        this.fullCss = this.locator;
        this.isPopupExist = options?.isPopup?.valueOf() !== undefined ? options?.isPopup?.valueOf() : false;
        this.pageIndex = options?.pageIndex?.valueOf() !== undefined ? options?.pageIndex?.valueOf() : 0;
        this.objectDescriptor = options?.description?.valueOf() !== undefined ? options?.description?.valueOf() : 'Object - ';
        this.hasFrame = options?.frameLocator?.valueOf() === undefined ? false : true;
        this.stringFramelocator = options?.frameLocator === undefined ? '' : options?.frameLocator;

    }

    /**
     * Get Page method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    protected async getPage() {
        if (this.isPopupExist === true) {
            if (playwrightWrapper.popup === undefined) {
                this.page = playwrightWrapper.popup;
                const [newPopup] = await Promise.all([
                    playwrightWrapper.page.waitForEvent('popup')
                ]);
                playwrightWrapper.popup = newPopup;
            }
            this.page = playwrightWrapper.popup;
        } else {
            const pages = playwrightWrapper.context.pages();
            this.page = pages[this.pageIndex];
        }


        if (playwrightWrapper.commonFrameLocator) {
            this.stringFramelocator = playwrightWrapper.commonFrameLocator;
        }
        if (this.stringFramelocator !== '') {
            await this.setHasFrame(true);
        } else {
            await this.setHasFrame(false);
        }


        this.frameLocator = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator) : this.frameLocator;

    }

    /**
     * Switch Page method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async switchPage(pageIndex: number) {
        this.pageIndex = pageIndex;
        return this;
    }

    /**
     * Set Frame Locator method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async setFrameLocator(loc: any) {
        this.stringFramelocator = loc;
    }

    /**
     * Set Has Frame method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async setHasFrame(flag: boolean) {
        this.hasFrame = flag;
    }
    /**
     * Get Has Frame method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getHasFrame() {
        return this.hasFrame;
    }

    /**
     * Set Locator method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async setLocator(locator: string, options?: { description?: string }) {
        await this.clearFullCssAndXPath();
        this.locator = locator;
        this.fullCss = this.locator;
        if (options?.description?.valueOf() !== undefined) this.objectDescriptor = options?.description;
        return this;
    }

    /**
     * Click To Open Popup method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickToOpenPopup(options?: { force?: boolean }) {
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        const [newPopup] = await Promise.all([
            playwrightWrapper.page.waitForEvent('popup'),
            playwrightWrapper.page.locator(await this.getLocator()).click({ force: _force })
        ]);
        playwrightWrapper.popup = newPopup;
    }

    /**
     * Get Elements method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    protected async getElements() {
        return await this.waitTillElementToBeReady().then(async () => {
            const resolvedLocator = await this.autoHealLocatorIfNeeded(await this.getLocator());
            let elements = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(resolvedLocator).all() : this.page.locator(resolvedLocator).all();
            // console.log('found element: ', ele['_selector']);
            return elements;

        })
    }

    /**
     * Get Element method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    protected async getElement() {
        return await this.waitTillElementToBeReady().then(async () => {
            const resolvedLocator = await this.autoHealLocatorIfNeeded(await this.getLocator());
            let ele = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(resolvedLocator) : this.page.locator(resolvedLocator);
            // console.log('found element: ', ele['_selector']);
            return ele;
        })
    }

    protected async autoHealLocatorIfNeeded(locator: string): Promise<string> {
        const autoHealEnabled = playwrightWrapper.autoHealEnabled?.valueOf() === undefined ? true : playwrightWrapper.autoHealEnabled;
        if (!autoHealEnabled) {
            return locator;
        }

        const currentCount = await this.safeLocatorCount(locator);
        if (currentCount > 0) {
            return locator;
        }

        const healedLocator = await this.findBestActionableLocator(locator);
        if (healedLocator !== '') {
            this.locator = healedLocator;
            this.fullCss = healedLocator;
            playwrightWrapper.logger.info(`Auto-heal applied on ${this.objectDescriptor}. Replaced locator with ${healedLocator}`);
            return healedLocator;
        }

        playwrightWrapper.logger.info(`Auto-heal skipped on ${this.objectDescriptor}. Unable to find actionable locator for ${locator}`);
        return locator;
    }

    protected async safeLocatorCount(locator: string): Promise<number> {
        try {
            const scopedLocator = await this.getScopedLocator(locator);
            return await scopedLocator.count();
        } catch {
            return 0;
        }
    }

    protected async getScopedLocator(locator: string): Promise<Locator> {
        return await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(locator) : this.page.locator(locator);
    }

    protected async findBestActionableLocator(originalLocator: string): Promise<string> {
        const tokens = this.extractLocatorTokens(originalLocator);
        const candidates = this.buildLocatorCandidates(originalLocator, tokens).slice(0, 80);

        let bestLocator = '';
        let bestScore = -1;

        for (const candidate of candidates) {
            const score = await this.scoreLocatorCandidate(candidate);
            if (score > bestScore) {
                bestScore = score;
                bestLocator = candidate;
            }
            if (score >= 90) {
                break;
            }
        }

        return bestScore > 0 ? bestLocator : '';
    }

    protected extractLocatorTokens(originalLocator: string): string[] {
        const tokenSet = new Set<string>();
        const tokenPattern = /[A-Za-z0-9_-]{3,}/g;
        const quotedPattern = /["'`]([^"'`]{2,})["'`]/g;
        const stopWords = new Set(['xpath', 'css', 'text', 'contains', 'button', 'link', 'div', 'span', 'class', 'name', 'role']);

        const descriptorWords = this.objectDescriptor.match(tokenPattern) || [];
        descriptorWords.forEach((value) => {
            const normalizedValue = value.trim().toLowerCase();
            if (!stopWords.has(normalizedValue)) {
                tokenSet.add(value.trim());
            }
        });

        const locatorWords = originalLocator.match(tokenPattern) || [];
        locatorWords.forEach((value) => {
            const normalizedValue = value.trim().toLowerCase();
            if (!stopWords.has(normalizedValue)) {
                tokenSet.add(value.trim());
            }
        });

        for (const match of originalLocator.matchAll(quotedPattern)) {
            if (match[1] && match[1].trim().length > 1) {
                tokenSet.add(match[1].trim());
            }
        }

        return Array.from(tokenSet).slice(0, 12);
    }

    protected buildLocatorCandidates(originalLocator: string, tokens: string[]): string[] {
        const candidateSet = new Set<string>();
        const escapedOriginal = originalLocator.trim();
        if (escapedOriginal !== '') {
            candidateSet.add(escapedOriginal);
        }

        const idRegex = /#([A-Za-z0-9_-]+)/g;
        for (const match of originalLocator.matchAll(idRegex)) {
            if (match[1]) {
                candidateSet.add(`#${match[1]}`);
                candidateSet.add(`[id="${this.escapeValue(match[1])}"]`);
            }
        }

        const attrRegex = /\[([A-Za-z0-9_-]+)=['"]?([^'"\]]+)['"]?\]/g;
        for (const match of originalLocator.matchAll(attrRegex)) {
            const attr = match[1];
            const val = match[2];
            if (attr && val) {
                candidateSet.add(`[${attr}="${this.escapeValue(val)}"]`);
            }
        }

        for (const token of tokens) {
            const escapedToken = this.escapeValue(token);
            const escapedTextToken = this.escapeTextSelector(token);
            candidateSet.add(`[id="${escapedToken}"]`);
            candidateSet.add(`[name="${escapedToken}"]`);
            candidateSet.add(`[data-testid="${escapedToken}"]`);
            candidateSet.add(`[data-test="${escapedToken}"]`);
            candidateSet.add(`[aria-label="${escapedToken}"]`);
            candidateSet.add(`[placeholder="${escapedToken}"]`);
            candidateSet.add(`[title="${escapedToken}"]`);
            candidateSet.add(`[value="${escapedToken}"]`);
            candidateSet.add(`button:has-text("${escapedTextToken}")`);
            candidateSet.add(`a:has-text("${escapedTextToken}")`);
            candidateSet.add(`[role="button"]:has-text("${escapedTextToken}")`);
            candidateSet.add(`[role="link"]:has-text("${escapedTextToken}")`);
            candidateSet.add(`label:has-text("${escapedTextToken}")`);
            candidateSet.add(`text="${escapedTextToken}"`);
        }

        return Array.from(candidateSet);
    }

    protected async scoreLocatorCandidate(locator: string): Promise<number> {
        try {
            const scopedLocator = await this.getScopedLocator(locator);
            const count = await scopedLocator.count();
            if (count <= 0) {
                return -1;
            }

            const first = scopedLocator.first();
            const isVisible = await first.isVisible().catch(() => false);
            const isEnabled = await first.isEnabled().catch(() => false);
            const meta = await first.evaluate((element: Element) => {
                const htmlElement = element as HTMLElement;
                const tag = htmlElement.tagName.toLowerCase();
                const role = htmlElement.getAttribute('role') || '';
                const inputType = (htmlElement as HTMLInputElement).type || '';
                return { tag, role, inputType };
            }).catch(() => ({ tag: '', role: '', inputType: '' }));

            let score = 0;
            score += count === 1 ? 40 : Math.max(1, 16 - Math.min(count, 15));
            if (isVisible) {
                score += 25;
            }
            if (isEnabled) {
                score += 20;
            }

            const actionableTags = ['a', 'button', 'input', 'select', 'textarea', 'label', 'summary'];
            if (actionableTags.includes(meta.tag)) {
                score += 20;
            }
            if (meta.role === 'button' || meta.role === 'link') {
                score += 20;
            }
            if (['button', 'submit', 'checkbox', 'radio'].includes(meta.inputType)) {
                score += 10;
            }
            if (locator.includes('data-testid') || locator.includes('[id=')) {
                score += 8;
            }

            return score;
        } catch {
            return -1;
        }
    }

    protected escapeValue(value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    protected escapeTextSelector(value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    /**
     * Set Css And XPath method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    protected async setCssAndXPath(element: Locator) {
        this.fullCss = (await cssPath(element)).toString();
        this.fullXpath = (await xPath(element)).toString();
    }



    /**
     * Click Link method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickLink(linkName: string, options?: { linkNameExactMatch?: boolean, force?: boolean }) {
        let _linkNameExactMatch = options?.linkNameExactMatch?.valueOf() !== undefined ? options?.linkNameExactMatch : true;
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        await this.waitTillElementToBeReady().then(async () => {
            if (linkName) {
                if (!await this.getHasFrame()) {
                    await this.page.getByRole('link', {
                        name: `${linkName} `, exact: _linkNameExactMatch
                    }).waitFor()

                    await this.page.getByRole('link', {
                        name: `${linkName} `, exact: _linkNameExactMatch
                    }).click({ force: _force });
                } else {
                    await this.page.frameLocator(this.stringFramelocator).getByRole('link', {
                        name: `${linkName} `, exact: _linkNameExactMatch
                    }).waitFor()

                    await this.page.frameLocator(this.stringFramelocator).getByRole('link', {
                        name: `${linkName} `, exact: _linkNameExactMatch
                    }).click({ force: _force });
                }

                await this.clearFullCssAndXPath();

                playwrightWrapper.logger.info(`clicked on the Link with name - ${linkName} with exact match - ${_linkNameExactMatch} on ${this.objectDescriptor} `);
            }
        })

    }

    /**
     * Type Chars method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async typeChars(chars: string) {
        const _chars = chars.split('');
        await this.getPage().then(async () => {
            for (const _char of _chars) {
                await this.page.keyboard.press(String(_char));
            }
        })
    }

    /**
     * Click Last Link method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickLastLink(options?: { force?: boolean }) {
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        playwrightWrapper.logger.info(`clicked on the last link  - ${this.objectDescriptor}`);
        await (await this.getElement()).last().click({ force: _force });
        await this.clearFullCssAndXPath();
    }

    /**
     * Click First Link method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickFirstLink(options?: { force?: boolean }) {
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;

        playwrightWrapper.logger.info(`clicked on the first link  - ${this.objectDescriptor}`);
        await (await this.getElement()).first().click({ force: _force });
        await this.clearFullCssAndXPath();


    }

    async getSibling(locator: string, nthElement = 0) {
        let ele = (await this.getElement()).locator('xpath=..').locator(locator).nth(nthElement);
        await this.setCssAndXPath(ele);
        return this;
    }

    /**
     * Get Next Sibling method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getNextSibling(tagName: string) {
        let ele = (await this.getElement());
        await this.setCssAndXPath(ele);
        let loct = this.fullCss + "+" + tagName;
        ele = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(loct) : this.page.locator(loct);
        await this.setCssAndXPath(ele);
        return this;
    }
    async getNextNthSibling(tagName: string, next: number = 0) {
        let ele = (await this.getElement());
        await this.setCssAndXPath(ele);
        for (let index = 0; index <= next; index++) {
            let loct = this.fullCss + "+" + tagName;
            ele = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(loct) : this.page.locator(loct);
            await this.setCssAndXPath(ele);
        }
        return this;
    }
    /**
     * Get Parent method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getParent() {
        let ele = (await this.getElement()).locator('..');
        await this.setCssAndXPath(ele);
        return this;
    }

    /**
     * Get Nth method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getNth(index: number) {
        let ele = (await this.getElement());
        ele = ele.nth(index);
        await this.setCssAndXPath(ele);
        return this;
    }

    /**
     * Get Count method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getCount() {
        let length = Number(await (await this.getElement()).count());
        await this.clearFullCssAndXPath();
        return length;
    }

    /**
     * Get Page Object method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getPageObject(index: number) {

        await (await this.getElement()).nth(index).focus()
        return (await this.getElement()).nth(index);

    }

    /**
     * Mouse Hover method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async mouseHover() {
        await (await this.getElement()).hover();
    }

    /**
     * Get Object method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getObject(index: number) {

        await (await this.getElement()).nth(index).focus()
        let ele = (await this.getElement()).nth(index);
        await this.setCssAndXPath(ele);
        return this;

    }

    //Value of Input  / TextArea fields
    async getValue(options?: { index: number }) {
        let _index = options?.index?.valueOf() !== undefined ? options?.index : 0;
        await (await this.getElement()).focus()
        let prpVal = await ((await this.getElement()).nth(_index).inputValue());
        await this.clearFullCssAndXPath();
        return prpVal ?? '';

    }

    /**
     * Get Property Value method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getPropertyValue(property: string, options?: { index: number }) {
        let _index = options?.index?.valueOf() !== undefined ? options?.index : 0;
        await (await this.getElement()).focus()
        let prpVal = property.trim().toLowerCase() === 'value' ? await ((await this.getElement()).nth(_index).inputValue()) : await ((await this.getElement()).nth(_index).getAttribute(property));
        await this.clearFullCssAndXPath();
        return prpVal ?? '';
    }

    /**
     * Contains method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async contains(containsText: string, options?: { index?: number, locator?: string }) {
        let _index = options?.index?.valueOf() !== undefined ? options?.index : 0;

        if (options?.locator?.valueOf() !== undefined) {
            let ele = await (await this.getElement()).locator(options.locator).filter({ hasText: `${containsText}` }).nth(_index);
            await this.setCssAndXPath(ele);
        } else {
            let ele = (await this.getElement()).filter({ hasText: `${containsText}` }).nth(_index);
            await this.setCssAndXPath(ele);
        }
        return this;

    }

    async hasText(containsText: string, exactMatch = false, options?: { index?: number }) {
        let _index = options?.index?.valueOf() !== undefined ? options?.index : 0;

        let ele = (await this.getElement()).getByText(`${containsText}`, { exact: exactMatch }).nth(_index);
        await this.setCssAndXPath(ele);
        return this;

    }

    /**
     * Clear Full Css And XPath method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    protected async clearFullCssAndXPath() {
        this.fullCss = this.locator.toString();
        this.fullXpath = ''.toString();
        return this;
    }

    /**
     * Contains Click method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async containsClick(containsText: string, options?: { force?: boolean, index?: number }) {
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        let _index = options?.index?.valueOf() !== undefined ? options?.index : 0;

        await (await this.getElement()).filter({ hasText: `${containsText}` }).nth(_index).click({ force: _force })
        await staticWait(100);
        playwrightWrapper.logger.info(`  clicked on the ${this.objectDescriptor} contains the text : [${containsText}]`);
        await this.clearFullCssAndXPath();

    }

    /**
     * Wait Till Element To Be Ready method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async waitTillElementToBeReady() {
        await this.getPage();
        await this.page.waitForTimeout(100);
        await this.page.waitForLoadState();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async getText(index = -1) {
        let _index = index === -1 ? 0 : index;
        let text = await (await this.getElement()).nth(_index).innerText();
        await this.clearFullCssAndXPath();
        playwrightWrapper.logger.info(`getting text from the locator : "${this.objectDescriptor}"`);
        return text;
    }

    /**
     * Get Current Object method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getCurrentObject() {
        return this;
    }

    /**
     * Get Page Title method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getPageTitle() {
        await this.getPage();
        let title = (await this.page.title()).toString();
        await this.clearFullCssAndXPath();
        return title;
    }

    /**
     * Is Exist method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async isExist() {
        await this.getPage();
        await this.page.waitForTimeout(10);
        await this.page.waitForLoadState();
        await this.page.waitForLoadState('domcontentloaded');
        let loc = await this.getLocator();
        let length = !await this.getHasFrame() ? await (this.page.locator(loc).all()) : await this.page.frameLocator(this.stringFramelocator).locator(await this.getLocator()).all();
        let flag = (await length).length > 0;
        await this.clearFullCssAndXPath();
        return flag;
    }

    /**
     * Is Enabled method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async isEnabled() {
        let enabled = (await this.getElement()).isEnabled();
        await this.clearFullCssAndXPath();
        return enabled;
    }

    /**
     * Is Disabled method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async isDisabled() {
        let disabled = (await this.getElement()).isDisabled();
        await this.clearFullCssAndXPath();
        return disabled;
    }

    /**
     * Is Checked method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async isChecked() {
        let checked = (await this.getElement()).isChecked();
        await this.clearFullCssAndXPath();
        return checked;
    }

    /**
     * Is Visible method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async isVisible() {
        let visible = (await this.getElement()).isVisible()
        await this.clearFullCssAndXPath();
        return visible;
    }

    async scrollIntoView(options: string = 'End') {
        await this.waitTillElementToBeReady();
        if (options.trim().toLowerCase() === 'end') {
            await this.page.keyboard.down(options);
        } else if (options.trim().toLowerCase() === 'start') {
            await this.page.keyboard.up(options);
        }
    }

    async scrollToBottomOfPage(count: number = 4) {
        await this.getPage();
        const screenHeight = await this.page.evaluate(() => document.body.scrollHeight); // get the page height
        for (let index = 0; index < count; index++) {
            await this.page.mouse.wheel(0, screenHeight);
            await staticWait(1000);
        }
    }

    async scrollToStartOfPage(count: number = 4) {
        await this.getPage();
        for (let index = 0; index < count; index++) {
            await this.page.mouse.wheel(0, 0);
            await staticWait(1000);
        }
    }
    /**
     * Child Has Text method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async childHasText(text: string, options?: { exactMatch?: boolean }) {
        await this.waitTillElementToBeReady();
        let _exactMatch = options?.exactMatch?.valueOf() !== undefined ? options?.exactMatch : false;
        if (_exactMatch) {
            let ele = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(await this.getLocator(), { has: this.page.frameLocator(this.stringFramelocator).locator(`text="${text}"`).nth(0) }).nth(0) : this.page.locator(await this.getLocator(), { has: this.page.locator(`text="${text}"`).nth(0) }).nth(0);

            await this.setCssAndXPath(ele);
            return this;
        } else {
            let ele = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(`${await this.getLocator()}:has-text("${text}")`).nth(0) : this.page.locator(`${await this.getLocator()}:has-text("${text}")`).nth(0);
            await this.setCssAndXPath(ele);
            return this;
        }

    }
    /**
     * Get Css method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getCss(cssValue: string) {
        return await this.getPage().then(async () => {
            let locatorE = (await this.getElement());
            let jsonVals = await locatorE.evaluate((element: any) => {
                console.log("getting css.....")
                let json = JSON.parse('{}');
                let cssObj = window.getComputedStyle(element);
                for (let i = 0; i < cssObj.length; i++) {
                    json[cssObj[i]] = cssObj.getPropertyValue(cssObj[i]);
                }
                return json;
            })
            await this.clearFullCssAndXPath();
            if (jsonVals[cssValue] !== '') {
                return jsonVals[cssValue];
            }
            else {
                return 'Invalid property';
            }
        })
    }

    /**
     * Get Locator method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    protected async getLocator() {
        return this.fullCss === this.locator ? this.locator : this.fullCss;
    }

    /**
     * Get Locator Full Css method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getLocatorFullCss() {
        return this.fullCss;
    }

    /**
     * Get Locator Full Xpath method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getLocatorFullXpath() {
        return this.fullXpath;
    }

    /**
     * Find method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async find(locator: string, options?: { index?: number, hasText?: string, nthObj?: number }) {
        let _index = options?.index?.valueOf() !== undefined ? options?.index : 0;
        let _objIndex = options?.nthObj?.valueOf() !== undefined ? options?.nthObj : 0;

        if (options?.hasText?.valueOf() === undefined) {
            let ele = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(`${await this.getLocator()} ${locator}`).nth(_index) : this.page.locator(`${await this.getLocator()} ${locator}`).nth(_index);
            await this.setCssAndXPath(ele);
        } else {
            let ele = (await this.getElement()).locator(locator, { hasText: `${options.hasText}` }).nth(_index);
            await this.setCssAndXPath(ele);
        }

        if (options?.nthObj?.valueOf() !== undefined) {
            let ele = (await this.getElement()).nth(_objIndex);
            await this.setCssAndXPath(ele);
        }
        return this;
    }

    /**
     * Set Description method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async setDescription(desc: string) {
        this.objectDescriptor = desc;
        return this;
    }

    /**
     * Get Text All Matching Objects method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getTextAllMatchingObjects() {
        let arr: string[] = []; // Initialize arr as an empty array of type string[]
        let count = await (await this.getElement()).count();
        for (let indx = 0; indx < count; indx++) {
            await staticWait(100);

            let iText = (await (await this.getElement()).nth(indx).innerText()).toString();
            arr.push(iText.trim());
        }
        await this.clearFullCssAndXPath();
        return arr;
    }

    /**
     * Clear method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clear(option?: { force?: boolean }) {
        let _force = option?.force?.valueOf() !== undefined;

        let ele = (await this.getElement());
        await this.setCssAndXPath(ele);
        await ele.clear({ force: _force });
        return this;

    }
    /**
     * Click method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async click(options?: { objIndex?: number, force?: boolean }) {
        let _objIndex = options?.objIndex?.valueOf() === undefined ? 0 : options?.objIndex;
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        const obj = (await this.getElement()).nth(_objIndex);
        await obj.click({ force: _force });
        playwrightWrapper.logger.info(`clicked on the ${this.objectDescriptor} of [${_objIndex}]`);
        await this.clearFullCssAndXPath();
    }

    /**
     * Dbl Click method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async dblClick(options?: { objIndex?: number, force?: boolean }) {
        let _objIndex = options?.objIndex?.valueOf() === undefined ? 0 : options?.objIndex;
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        const obj = (await this.getElement()).nth(_objIndex);
        await obj.dblclick({ force: _force });
        playwrightWrapper.logger.info(`dbl clicked on the ${this.objectDescriptor} of [${_objIndex}`);
        await this.clearFullCssAndXPath();

    }
    async waitForDomComplete(page: Page, pollDelay = 10, stableDelay = 500) {
        let markupPrevious = '';
        const timerStart = new Date();
        let isStable = false;
        let counter = 0;
        while (!isStable) {
            ++counter;
            const markupCurrent = await page.evaluate(() => document.body.innerHTML);
            const elapsed = new Date().getTime() - timerStart.getTime();
            if (markupCurrent == markupPrevious) {
                isStable = stableDelay <= elapsed;
            } else {
                markupPrevious = markupCurrent;
            }
            if (!isStable) {
                await new Promise(resolve => setTimeout(resolve, pollDelay));
            }

        }
    }


    async getAllObjects(options?: { hasText?: string }): Promise<UiElement[]> {
        if (options?.hasText === undefined) {
            const arrayLocators = await (await this.getElement()).locator(':scope', { has: (await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(this.locator) : this.page.locator(this.locator)) }).all();
            arrayLocators.forEach((loc: Locator) => {
                this.tempLocators.push(loc);
            });
        } else {
            const arrayLocators = await (await this.getElement()).locator(this.locator, { hasText: `${options.hasText}` }).all();
            arrayLocators.forEach((loc: Locator) => {
                this.tempLocators.push(loc);
            });
        }

        const uiElements: UiElement[] = await Promise.all(this.tempLocators.map(async (loc: any, index: number) => {
            const cssLocator = (await cssPath(loc)).toString();
            return new UiElement(cssLocator, { description: `${this.objectDescriptor} [${index}]` });
        }));
        return uiElements;
    }
    /*
    async getAllObjects(locator: string, options?: { hasText?: string }) {

        if (options?.hasText?.valueOf() === undefined) {
            let arrayLocators = await (await this.getElement()).locator(':scope', { has: this.page.locator(locator) }).all();
            await (await arrayLocators).forEach((loc: Locator) => {
                this.tempLocators.push(loc);
            })

        } else {
            let arrayLocators = await (await this.getElement()).locator(locator, { hasText: `${options.hasText}` }).all();
            await (await arrayLocators).forEach((loc: Locator) => {
                this.tempLocators.push(loc);
            })
        }

        let uiElements: UiElement[];
        this.tempLocators.forEach(async (loc: any, index: number) => {
            let cssLocator = await (await cssPath(loc)).toString();
            let ele = new UiElement(cssLocator, { description: `${this.objectDescriptor} [${index}]` })
            uiElements.push(ele);
        })
        return uiElements;
    }
*/

    async chooseFiles(files: string[]) {
        await this.waitTillElementToBeReady().then(async () => {
            await (await this.getElement()).setInputFiles(files)
            await this.waitTillElementToBeReady();
            await this.clearFullCssAndXPath();
        })
    }

    /**
     * Check method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async check(options?: { objIndex?: number, force?: boolean }) {
        let _objIndex = options?.objIndex === undefined ? 0 : options?.objIndex;
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;

        await this.waitTillElementToBeReady().then(async () => {
            const obj = _objIndex > -1 ? (await this.getElement()).nth(_objIndex) : (await this.getElement()).first();
            let flag = await obj.getAttribute('disabled')
            if (!flag) {
                await obj.check({ force: _force })
                playwrightWrapper.logger.info(`${this.objectDescriptor} - checked the checkbox`);
            } else {
                playwrightWrapper.logger.info(`${this.objectDescriptor} - unable to check the checkbox, its disabled`);
            }
            await this.clearFullCssAndXPath();
        })
    }

    /**
     * Uncheck method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async uncheck(options?: { objIndex?: number, force?: boolean }) {
        let _objIndex = options?.objIndex === undefined ? 0 : options?.objIndex;
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;

        const obj = _objIndex > -1 ? (await this.getElement()).nth(_objIndex) : (await this.getElement()).first();
        let flag = await obj.getAttribute('disabled')
        if (!flag) {
            await obj.uncheck({ force: _force })
            playwrightWrapper.logger.info(`${this.objectDescriptor} - unchecked the checkbox`);
        } else {
            playwrightWrapper.logger.info(`${this.objectDescriptor} - unable to uncheck the checkbox, its disabled`);
        }
        await this.clearFullCssAndXPath();
    }

    /*
        Allowed Keys : F1 - F12, Digit0- Digit9, KeyA- KeyZ, Backquote, Minus, Equal, Backslash, Backspace, Tab, Delete, Escape, ArrowDown, End, Enter, Home, Insert, PageDown, PageUp, ArrowRight, ArrowUp, etc.     
    */
    async setValue(inputString: any, options?: { keyPress?: string, force?: boolean }) {
        let _force = options?.force?.valueOf() !== undefined ? options?.force : false;
        await (await this.getElement()).clear();
        await (await this.getElement()).fill(inputString.toString(), { force: _force });
        if (options?.keyPress?.valueOf() !== undefined) {
            await (await this.getElement()).press(options?.keyPress);
        }
        playwrightWrapper.logger.info(`${this.objectDescriptor} - Set the value -  ${this.objectDescriptor.toLowerCase().includes('password') ? '*******' : inputString}`);
        await this.clearFullCssAndXPath();
    }



    /*
        Allowed Keys : F1 - F12, Digit0- Digit9, KeyA- KeyZ, Backquote, Minus, Equal, Backslash, Backspace, Tab, Delete, Escape, ArrowDown, End, Enter, Home, Insert, PageDown, PageUp, ArrowRight, ArrowUp, etc.
    
    */
    async type(inputString: string, options?: { delay?: number, keyPress?: string, clearAndType?: boolean }) {
        let _delay = options?.delay?.valueOf() !== undefined ? 0 : options?.delay;
        let _clearAndType = options?.clearAndType?.valueOf() !== undefined ? false : options?.clearAndType;
        if (_clearAndType) { (await this.getElement()).clear({ force: true }); }
        await (await this.getElement()).type(inputString, { delay: _delay });
        if (options?.keyPress?.valueOf() !== undefined) {
            await (await this.getElement()).press(options?.keyPress);
        }
        playwrightWrapper.logger.info(`${this.objectDescriptor} - Type the value -  ${this.objectDescriptor.toLowerCase().includes('password') ? '*******' : inputString}`);
        await this.clearFullCssAndXPath();
    }

    /**
     * Press Sequentially method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async pressSequentially(inputString: any, options?: { delay?: number, keyPress?: string }) {
        let _delay = options?.delay?.valueOf() !== undefined ? 0 : options?.delay;
        await (await this.getElement()).pressSequentially(inputString, { delay: _delay });
        if (options?.keyPress?.valueOf() !== undefined) {
            await (await this.getElement()).press(options?.keyPress);
        }
        playwrightWrapper.logger.info(`${this.objectDescriptor} - pressSequentially the value -  ${this.objectDescriptor.toLowerCase().includes('password') ? '*******' : inputString}`);
        await this.clearFullCssAndXPath();
    }

    /**
     * Select List Option By Text method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async selectListOptionByText(option: string) {
        await (await this.getElement()).selectOption(option)
        playwrightWrapper.logger.info(`${this.objectDescriptor} - Selecting the option : ` + option)
        await this.clearFullCssAndXPath();
    }

    /**
     * Select List Option By Index method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async selectListOptionByIndex(indexOf: number) {
        await (await this.getElement()).selectOption({ index: indexOf })
        playwrightWrapper.logger.info(`${this.objectDescriptor} - Selecting the option index : ` + indexOf)
        await this.clearFullCssAndXPath();
    }

    /**
     * Get List Options method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getListOptions() {
        let innerTexts = await this.getHasFrame() ? await this.page.frameLocator(this.stringFramelocator).locator(await this.getLocator() + ' option').allInnerTexts() : await this.page.locator(await this.getLocator() + ' option').allInnerTexts();
        await this.clearFullCssAndXPath();
        return innerTexts;
    }
    async getSelectedListValue(): Promise<string> {
        const selectedOption = await (await this.getElement()).locator(await this.getLocator() + '[aria-selected="true"]').first();
        const value = await selectedOption.innerText();
        await this.clearFullCssAndXPath();
        return value;
    }

    /**
     * Get Ui Element method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getUiElement() {
        let ele = await new UiElement('xpath=' + (await this.getLocatorFullXpath()));
        this.clearFullCssAndXPath();
        return ele;
    }

    /**
     * Get Column Has Text method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getColumnHasText(cellvalue: string) {
        let ele = (await this.getElement()).locator('td').filter({ hasText: `${cellvalue} ` });
        await this.setCssAndXPath(ele);
        return this;
    }

    /**
     * Wait For Rows To Load method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async waitForRowsToLoad(options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        await (await this.getElement()).locator(_locator).nth(0).waitFor({ state: "attached", timeout: 60000 });
        return this;
    }

    /**
     * Wait For Home Tabs To Load method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async waitForHomeTabsToLoad(options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'ecp-ucl-skeleton-loader' : options?.locator;
        await (await this.getElement()).locator(_locator).nth(0).waitFor({ state: "hidden", timeout: 60000 });
        return this;
    }

    /**
     * The function `getCellData` retrieves the data from a specific cell in a table based on the given
     * row and column indices.
     * @param {number} row - The `row` parameter is the index of the row from which you want to
     * retrieve the cell data. It is a number that represents the position of the row in a table or
     * grid.
     * @param {number} col - The `col` parameter in the `getCellData` function represents the column
     * number of the cell from which you want to retrieve data.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns the cell data as a string.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getCellData(row: number, col: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        playwrightWrapper.logger.info(`getting cell data from ${this.objectDescriptor} - Row,Column [${row},${col}]`);
        let val = await (await this.getElement()).locator(_locator).nth(row).locator('td').nth(col).innerText();
        await this.clearFullCssAndXPath();
        playwrightWrapper.logger.info(`Row,Column [${row},${col}] = ${val}`);
        return val.toString();
    }

    /**
     * The function `getRowData` retrieves the inner texts of all elements in a specified row of a
     * table.
     * @param {number} row - The `row` parameter is the index of the row you want to retrieve data
     * from. It is a number that represents the position of the row in a table or list.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns an array of inner texts of elements in a row.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getRowData(row: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let arr = await (await this.getElement()).locator(_locator).nth(row).allInnerTexts();
        await this.clearFullCssAndXPath();
        return arr;
    }

    /**
     * Get Row Data As Array method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getRowDataAsArray(row: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let aRow = (await this.getElement()).locator(_locator).nth(row);
        let arr = new Array();
        let columnLenth = await aRow.locator('td').count();
        for (let index = 0; index < columnLenth; index++) {
            let data = await (await aRow.locator('td').nth(index).innerText()).toString();
            arr.push(data);
        }
        await this.clearFullCssAndXPath();
        return arr;
    }

    /**
     * The function `getAllRowsColumnData` retrieves the data from a specific column in a table, with
     * an optional locator parameter to specify the table rows.
     * @param {number} column - The `column` parameter is the index of the column you want to retrieve
     * data from. It is a number that represents the position of the column in the table, starting from
     * 0 for the first column.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns an array of data from a specific column in a table.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getAllRowsColumnData(column: number, options?: { locator?: string, numberofRows?: number, startRowNumber?: number }) {
       let _locator = options?.locator?.valueOf() === void 0 ? "tr" : options?.locator;
        let _startRowNumber = options?.startRowNumber?.valueOf() === void 0 ? 0 : options?.startRowNumber;
        let _numberofRows = options?.numberofRows?.valueOf() === void 0 ? 0 : options?.numberofRows;
        let arr = [];
        let actualLength = await (await this.getElement()).locator(_locator).count();
        let length = _numberofRows === 0 ? actualLength : actualLength < _numberofRows ? actualLength : _numberofRows;
        for (let index = _startRowNumber; index < length; index++) {
          let text = await (await this.getElement()).locator(_locator).nth(index).locator("td").nth(column).innerText();
          arr.push(text);
        }
        await this.clearFullCssAndXPath();
        return arr;

    }

    /**
     * The function retrieves the inner texts of all th elements within a specified element and returns
     * them as an array.
     * @returns an array of header names.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getHeaderNames() {
        let arr = await (await this.getElement()).locator('th').allInnerTexts();
        await this.clearFullCssAndXPath();
        return arr;
    }

    /**
     * The function tbody() asynchronously locates the tbody element, sets its CSS and XPath, and
     * returns the coding assistant.
     * @returns This `async tbody()` function is returning the current object (`this`) after setting
     * the CSS and XPath properties of the `tbody` element obtained from the `getElement()` function.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async tbody() {
        let ele = (await this.getElement()).locator('tbody');
        await this.setCssAndXPath(ele);
        return this;
    }

    /**
     * The above function is an asynchronous method in TypeScript that locates the 'thead' element,
     * sets its CSS and XPath properties, and returns the updated element.
     * @returns The `thead` element is being returned after setting its CSS and XPath properties.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async thead() {
        let ele = (await this.getElement()).locator('thead');
        await this.setCssAndXPath(ele);
        return this;
    }
    /**
     * The function `getRow` retrieves a specific row element from a table based on the given index and
     * optional locator.
     * @param {number} index - The index parameter is a number that represents the position of the row
     * you want to retrieve. It is used to specify which row to select from a table or list of rows.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns a Promise that resolves to the current instance of the object.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getRow(index: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        return await this.waitTillElementToBeReady().then(async () => {
            let ele = (await this.getElement()).locator(_locator).nth(index);
            await this.setCssAndXPath(ele);
            return this;
        })
    }

    /**
     * The function `getTable` retrieves a table element from the page and sets its CSS and XPath
     * properties.
     * @param [index=0] - The index parameter is used to specify the index of the element to be
     * retrieved from the list of elements. It is an optional parameter with a default value of 0.
     * @returns the current instance of the object.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getTable(index = 0) {
        let ele = (await this.getElement()).nth(index);
        await this.setCssAndXPath(ele);
        return this;
    }

    /**
     * The function `getHederColumnNumber` returns the index of a column header in a table based on its
     * name, with an option for exact or case-insensitive matching.
     * @param {string} colName - The `colName` parameter is a string that represents the name of the
     * column you want to find the number of.
     * @param [exactMatch=false] - The `exactMatch` parameter is a boolean value that determines
     * whether the column name should be matched exactly or not. If `exactMatch` is set to `true`, the
     * column name must match exactly (including case sensitivity). If `exactMatch` is set to `false`
     * (or not provided
     * @returns the index of the column header with the specified name.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getHederColumnNumber(colName: string, exactMatch = false) {
        const innerTextArr = await (await this.getElement()).locator('th').allInnerTexts();
        await this.clearFullCssAndXPath();
        if (exactMatch) {
            return innerTextArr.findIndex((ele: string) => ele.trim() === colName.trim());
        }
        return innerTextArr.findIndex((ele: string) => ele.trim().toLowerCase() === colName.trim().toLowerCase());
    }

    /**
     * The function `getHeaderName` retrieves the text of a table header element at a specified index.
     * @param {number} index - The `index` parameter is a number that represents the position of the
     * table header element in the table. It is used to specify which table header element to retrieve
     * the name from.
     * @returns the text of the header name at the specified index.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getHeaderName(index: number) {
        let text = await (await this.getElement()).locator('th').nth(index).innerText();
        await this.clearFullCssAndXPath();
        return text;
    }

    /**
     * The function `getHeaderColumnLength` returns the number of header columns in a table after
     * waiting for the element to be ready.
     * @returns the length of the header column.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getHeaderColumnLength() {
        return await this.waitTillElementToBeReady().then(async () => {
            let headerCount = Number(await (await this.getElement()).locator('th').count());
            await this.clearFullCssAndXPath();
            return headerCount;
        })
    }

    /**
     * The function returns the number of rows in a table, using a specified locator or the default
     * locator if none is provided.
     * @param [options] - An optional object that can contain the following property:
     * @returns the length of rows in a table.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getRowsLength(options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        return await this.waitTillElementToBeReady().then(async () => {
            let ele = await this.getElement();
            await this.setCssAndXPath(ele);
            this.fullCss = this.fullCss + ' ' + _locator;
            ele = await this.getElement();
            let count = await this.isExist() ? Number(await ele.count()) : 0;
            await this.clearFullCssAndXPath();
            playwrightWrapper.logger.info(`Number of rows in the table = ${count}`);
            return count;
        })
    }

    /**
     * The function `getMetaTableRowsLength` returns the number of rows in a table element.
     * @param [options] - An optional object that can contain the following properties:
     * @returns the length of the table rows that match the specified locator.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getMetaTableRowsLength(options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        return await this.waitTillElementToBeReady().then(async () => {
            this.fullCss = (await this.getLocator()).toString() + ' tr';
            let length = await this.isExist() ? Number(await (await this.getElement()).locator(_locator).count()) : 0;
            await this.clearFullCssAndXPath();
            return length;
        })

    }

    /**
     * Get Column Length method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getColumnLength(rowIndex?: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let rowI = rowIndex ?? 0;
        let length = Number(await (await this.getElement()).locator(_locator).nth(rowI).locator('td').count());
        await this.clearFullCssAndXPath();
        return length;
    }

    /**
     * Get Row Column method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getRowColumn(rowIndex: number, columnIndex: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let rowColumn = (await this.getElement()).locator(_locator).nth(rowIndex).locator('td').nth(columnIndex);
        await this.setCssAndXPath(rowColumn);
        return this;
    }

    /**
     * The `getMatchedRowIndex` function is an asynchronous function that takes an array of row values
     * and an optional options object as parameters, and returns the index of the first row that
     * matches the given values in a table.
     * @param {string[]} rowValues - An array of string values representing the values to match in each
     * row of a table.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns a Promise that resolves to the index of the matched row in the table. If a match is
     * found, it returns the index of the row. If no match is found, it returns -1.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getMatchedRowIndex(rowValues: string[], options?: { locator?: string, exactMatch?: boolean }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        let arr = new Array();
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim().includes(`'`) ? ele.trim().split(`'`)[1] : ele.trim();
        });

        return await this.waitTillElementToBeReady().then(async () => {
            await (await this.getElement()).locator(_locator).nth(0).waitFor();
            const rows = await (await this.getElement()).locator(_locator).count();
            for (let index = 0; index < rows; index++) {
                const table_data = await ((await this.getElement()).locator(_locator).nth(index).allInnerTexts());
                let rowdata = table_data.toString().split(/[\n\t]/g);
                playwrightWrapper.logger.info(`Actual Table Row data = ${rowdata}`);
                if (rowdata.length > 1) {
                    arr.push(rowdata);
                }
            }
            let row_index = arr.findIndex((row_text) => {
                for (const col_data of rowValues) {
                    if (_exactMatch) {
                        if (row_text.findIndex((ele: any) => ele.trim().toLowerCase() === col_data.toLowerCase().trim()) < 0) return false;
                    }
                    else if (row_text.findIndex((ele: any) => ele.trim().toLowerCase().includes(col_data.toLowerCase().trim())) < 0) return false;
                }
                return true;
            });
            await this.clearFullCssAndXPath();
            if (row_index >= 0) {
                return row_index;
            }
            return -1;
        })
    }

    /**
     * The function `getMatchedRowIndices` is an asynchronous function that takes an array of row
     * values and an optional options object as parameters, and returns an array of indices of rows
     * that match the given values.
     * @param {string[]} rowValues - An array of string values representing the values to match in each
     * row.
     * @param [options] - The `options` parameter is an optional object that can contain two
     * properties:
     * @returns an array of indices that match the specified row values.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getMatchedRowIndices(rowValues: string[], options?: { locator?: string, exactMatch?: boolean }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim().includes(`'`) ? ele.trim().split(`'`)[1] : ele.trim();
        })
        let foundIndices = new Array();

        const nRows = await (await this.getElement()).count()
        for (let index = 0; index < nRows; index++) {
            await (await this.getElement()).locator(_locator).nth(index).allInnerTexts().then(async (row_text) => {
                let row_text_arr = row_text.toString().split('\n');

                for (const col_data of rowValues) {

                    if (_exactMatch) {
                        if (row_text_arr.findIndex(ele => ele.trim().toLowerCase() === col_data.toLowerCase().trim()) < 0) return false;
                    }
                    else if (row_text_arr.findIndex(ele => ele.trim().toLowerCase().includes(col_data.toLowerCase().trim())) < 0) return false;
                }
                return true;
            }).then(flag => {
                if (flag) {
                    foundIndices.push(index);
                }
            })
        }
        await this.clearFullCssAndXPath();
        return foundIndices;

    }

    /**
     * The function `getMetaTableMatchedRowIndex` is an asynchronous function that searches for a row
     * in a table based on the provided row values and returns the index of the matched row.
     * @param {string[]} rowValues - An array of string values representing the values to match in each
     * row of the table.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns the index of the matched row in the meta table. If a match is found, it returns the
     * index of the row. If no match is found, it returns -1.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getMetaTableMatchedRowIndex(rowValues: string[], options?: { locator?: string, exactMatch?: boolean }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        let arr = new Array();
        await (await this.getElement()).locator(_locator).nth(0).waitFor()
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim();
        })
        const rows = await (await this.getElement()).locator(_locator).count();
        for (let index = 0; index < rows; index++) {
            const table_data = await ((await this.getElement()).locator(_locator).nth(index).allInnerTexts());
            let rowdata = table_data.toString().split('\t').join('').split('\n');
            if (rowdata.length > 1) {
                arr.push(rowdata);
            }

        }
        let row_index = arr.findIndex((row_text) => {
            for (const col_data of rowValues) {
                if (_exactMatch) {
                    if (row_text.findIndex((ele: any) => ele.trim().toLowerCase() === col_data.toLowerCase().trim()) < 0) return false;
                }
                else if (row_text.findIndex((ele: any) => ele.trim().toLowerCase().includes(col_data.toLowerCase().trim())) < 0) return false;
            }
            return true;
        });
        await this.clearFullCssAndXPath();
        if (row_index >= 0) {
            return row_index;
        }
        return -1;

    }

    /**
     * Get Meta Table Matched Row Indices method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async getMetaTableMatchedRowIndices(rowValues: string[], options?: { locator?: string, exactMatch?: boolean, minColumnSize: number }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        let _minColumnSize = options?.minColumnSize?.valueOf() === undefined ? 1 : options?.minColumnSize;
        console.log('Recieved data : ' + rowValues);
        let arr = new Array();
        let foundIndices = new Array();


        let rows = await (await this.getElement()).locator(_locator).all();
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim().includes(`'`) ? ele.trim().split(`'`)[1] : ele.trim();
        })

        console.log(rowValues);
        for (let row of rows) {
            let arrTds = new Array();
            let cols = await row.locator('td').all();
            for (let col of cols) {
                arrTds.push((await col.innerText()).toString().trim());
            }
            if (arrTds.length > _minColumnSize)
                arr.push(arrTds);
        }

        for (const element of arr) {
            let row_index = arr.findIndex((row_text: any) => {
                for (const col_data of rowValues) {
                    if (_exactMatch) {
                        if (row_text.findIndex((ele: any) => ele.trim().toLowerCase() === col_data.toLowerCase().trim()) < 0) return false;
                    }
                    else if (row_text.findIndex((ele: any) => ele.trim().toLowerCase().includes(col_data.toLowerCase().trim())) < 0) return false;
                }
                return true;
            })
            if (row_index >= 0) {
                arr[row_index] = [];
                foundIndices.push(row_index);
            }
        }
        return foundIndices;

    }

    /**
     * Click Meta Table Row Link method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickMetaTableRowLink(rowIndex: number, options?: { linkName?: string, lnkIndex?: number, locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _linkName = options?.linkName?.valueOf() === undefined ? false : options?.linkName;
        let _lnkIndex = options?.lnkIndex?.valueOf() === undefined ? -1 : options?.lnkIndex;

        const row = (await this.getElement()).nth(rowIndex).locator(_locator).nth(0);
        const temp = _lnkIndex > -1 ? row.locator('a').nth(_lnkIndex - 1) : row.locator('a').first();
        const link = _linkName !== '' ? row.filter({ hasText: `${_linkName}` }) : temp;
        await link.click();
        await this.clearFullCssAndXPath();
    }

    /**
     * Click Row By Link Name method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickRowByLinkName(rowIndex: number, options?: { linkName?: string, lnkIndex?: number, locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _linkName = options?.linkName?.valueOf() === undefined ? false : options?.linkName;
        let _lnkIndex = options?.lnkIndex?.valueOf() === undefined ? -1 : options?.lnkIndex;

        const row = (await this.getElement()).locator(_locator).nth(rowIndex);
        const temp = _lnkIndex > -1 ? row.locator('a').nth(_lnkIndex - 1) : row.locator('a').first();
        const link = _linkName !== '' ? row.filter({ hasText: `${_linkName}` }) : temp;
        await link.click();
        await this.clearFullCssAndXPath();

    }

    /**
     * Is Column Value Exist method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async isColumnValueExist(colValue: string) {
        let exist = await (await this.getElement()).locator('td').filter({ hasText: `${colValue} ` }).count() > 0
        await this.clearFullCssAndXPath();
        return exist;
    }

    /**
     * Click Row Link method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async clickRowLink(rowIndex: number, options?: { linkIndex?: number, force?: boolean, locator?: string }) {
        let _lIndex = options?.linkIndex?.valueOf() !== undefined ? options?.linkIndex?.valueOf() : 0;
        let _force = options?.force?.valueOf() !== undefined ? options?.force?.valueOf() : false;

        const row = await this.getHasFrame() ? this.page.frameLocator(this.stringFramelocator).locator(await this.getLocator() + ' tr').nth(rowIndex) : this.page.locator(await this.getLocator() + ' tr').nth(rowIndex);
        await row.locator('a').nth(_lIndex).click({ force: _force });
        await this.clearFullCssAndXPath();
    }

    /**
     * Meta Table Click Row Link method.
     
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
    async metaTableClickRowLink(rowIndex: number, options?: { locator?: string, lnkIndex?: number }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _lnkIndex = options?.lnkIndex?.valueOf() === undefined ? -1 : options?.lnkIndex;
        const row = (await this.getElement()).nth(rowIndex).locator(_locator).nth(0);
        if (await row.getByRole('link').nth(_lnkIndex).isEnabled()) {
            await row.getByRole('link').nth(_lnkIndex).click();
        } else {
            playwrightWrapper.logger.error(_locator + ' text row is not enabled');
        }
        await this.clearFullCssAndXPath();
    }

}

export const playwrightWrapper = {
    // @ts-ignore
    page: undefined as Page,
    apiContext: undefined as unknown as APIRequestContext,
    popup: undefined as unknown as Page,
    newPage: undefined as unknown as Page,
    context: undefined as unknown as BrowserContext,
    browser: undefined as unknown as Browser,
    logger: customLogger,
    commonFrameLocator: undefined as unknown as string,
    autoHealEnabled: true
}

/**
 * Set Auto Heal method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export function setAutoHeal(enabled: boolean) {
    playwrightWrapper.autoHealEnabled = enabled;
}

export const invokeBrowser = async (browserType: string, options?: { headless?: boolean, channel?: string }) => {
    console.log('in invoke browser : ' + browserType);
    let _headless = options?.headless?.valueOf() === undefined ? true : options?.headless?.valueOf();
    let _channel = options?.channel?.valueOf() !== undefined ? options?.channel?.valueOf() : '';

    switch (browserType) {
        case "chrome":
            return await chromium.launch({ headless: _headless });
        case "firefox":
            return await firefox.launch({ headless: _headless });
        case "webkit":
            return await webkit.launch({ headless: _headless });
        case "msedge":
            return await chromium.launch({
                channel: 'msedge',
                headless: _headless,
            });
        default:
            return await chromium.launch({ headless: _headless });
    }

}

/**
 * Wait For Page Load method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function waitForPageLoad() {
    await playwrightWrapper.page.waitForLoadState('domcontentloaded');
    await playwrightWrapper.page.waitForLoadState();
    return true;
}

/**
 * Wait For Url method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function waitForUrl(url: string) {

    playwrightWrapper.logger.info(' Waiting for the URL : ' + url)
    await playwrightWrapper.page.waitForURL(url, { timeout: 120000, waitUntil: 'domcontentloaded' })
}

/**
 * Wait For Spinner Hidden method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function waitForSpinnerHidden() {
    let _locator = '.spinner';
    await playwrightWrapper.page.locator(_locator).nth(0).waitFor({ state: "hidden", timeout: 60000 });
}

/**
 * Static Wait method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function staticWait(timeOut: number, isPage: boolean = true, waitForSpinner: boolean = true) {
    if (isPage) {
        playwrightWrapper.logger.info(`Waiting for the page : ${timeOut} milliseconds`);
        if (waitForSpinner) { await waitForSpinnerHidden(); }
        await playwrightWrapper.page.waitForTimeout(timeOut);
    } else {
        playwrightWrapper.logger.info(`Waiting for the popup : ${timeOut} milliseconds`);
        await playwrightWrapper.popup.waitForTimeout(timeOut);
    }
}

/**
 * Goto Url method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function gotoUrl(url: string) {
    // await playwrightWrapper.page.route('**/*.{png,jpg,jpeg}', route => route.abort());
    await playwrightWrapper.page.goto(url, { timeout: 500000, waitUntil: 'domcontentloaded' });
    playwrightWrapper.logger.info('Launching URL : ' + url)
}

/**
 * Closeplaywright method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function closeplaywright() {
    if (playwrightWrapper.popup !== undefined) {
        await playwrightWrapper.popup.close();
    }
    if (playwrightWrapper.page) {
        await playwrightWrapper.page.close();
    }
}

/**
 * Get Url method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function getUrl(pageIndex: number = 0) {
    const pages = playwrightWrapper.context.pages();
    const page = pages[pageIndex];
    await waitForPageLoad();
    return page.url().toString();
}

/**
 * Pause method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function pause(options?: { isPage?: boolean }) {
    let _flag = options?.isPage?.valueOf() === undefined ? true : options?.isPage?.valueOf();
    if (_flag) {
        await playwrightWrapper.page.pause();
    } else {
        await playwrightWrapper.popup.pause();
    }
}

/**
 * Refresh Page method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function refreshPage(options?: { isPage?: boolean }) {
    let _flag = options?.isPage?.valueOf() === undefined ? true : options?.isPage?.valueOf();
    if (_flag) {
        await playwrightWrapper.page.reload();
    } else {
        await playwrightWrapper.popup.reload();
    }
}

/**
 * Get Api Response method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function getApiResponse(url: string) {
    const response = await playwrightWrapper.page.waitForResponse((response) => response.url().includes(url));
    return response;

}

/**
 * Loop Through Elements And Click method.
 
 *
 * Usage:
 * - Use this method in your Playwright test flow with parameters shown in its signature.
 *
 * @example
 * // See the method signature directly below and pass matching arguments.
 */
export async function loopThroughElementsAndClick(locatorVal: any, index: Number = 0, action: string = 'click') {
    const allElements = await playwrightWrapper.page.locator(locatorVal).all();
    let count = 0;
    for (let locElement of allElements) {
        if (count === index) {
            action.toLowerCase() === 'click' ? await locElement.click() : await locElement.innerText();
            return locElement;
        }
        count++;
    }
}





/*
 
F1 - F12, Digit0- Digit9, KeyA- KeyZ, Backquote, Minus, Equal, Backslash, Backspace, Tab, Delete, Escape, ArrowDown, End, Enter, Home, Insert, PageDown, PageUp, ArrowRight, ArrowUp, etc.
 
*/

export async function keyboard(method: string, key: string, options?: { isPage?: boolean, pageIndex?: number }) {
    let _isPage = options?.isPage?.valueOf() === undefined ? true : options?.isPage;
    let _pageIndex = options?.pageIndex?.valueOf() === undefined ? 0 : options?.pageIndex;
    let page: Page;

    if (_isPage !== true) {
        if (playwrightWrapper.popup === undefined) {

            const [newPopup] = await Promise.all([
                playwrightWrapper.page.waitForEvent('popup')
            ]);
            playwrightWrapper.popup = newPopup;;
        }
        page = playwrightWrapper.popup;
    } else {
        const pages = playwrightWrapper.context.pages();
        page = pages[_pageIndex];
    }
    key = key.charAt(0).toUpperCase() + key.slice(1);
    playwrightWrapper.logger.info(`Keybaord method : ${method} - ${key}`);
    switch (method.toLowerCase().trim()) {
        case 'type':
            await page.keyboard.type(key);
            return;
        case 'up':
            await page.keyboard.up(key);
            return;
        case 'down':
            await page.keyboard.down(key);
            return;
        case 'press':
            await page.keyboard.press(key);
            return;
        case 'inserttext':
            await page.keyboard.insertText(key);
            return;
    }

}
