import { Locator } from "@playwright/test";

export class CustomMethods {

    async getTextAllMatchingObjects(page: Locator) {
        let arr: string[] = []; // Initialize arr as an empty array of type string[]
        let count = await page.count();
        for (let indx = 0; indx < count; indx++) {
            let iText = (await page.nth(indx).innerText()).toString();
            arr.push(iText.trim());
        }
        return arr;
    }


    async getCss(page: Locator, cssValue: string) {
        let jsonVals = await page.evaluate((element: any) => {
            console.log("getting css.....")
            let json = JSON.parse('{}');
            let cssObj = window.getComputedStyle(element);
            for (let i = 0; i < cssObj.length; i++) {
                json[cssObj[i]] = cssObj.getPropertyValue(cssObj[i]);
            }
            return json;
        })

        if (jsonVals[cssValue] !== '') {
            return jsonVals[cssValue];
        }
        else {
            return 'Invalid property';
        }
    }



    async pressSequentially(page: Locator, inputString: any, options?: { delay?: number, keyPress?: string }) {
        let _delay = options?.delay?.valueOf() !== undefined ? 0 : options?.delay;
        await page.pressSequentially(inputString, { delay: _delay });
        if (options?.keyPress?.valueOf() !== undefined) {
            await page.press(options?.keyPress);
        }
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
     */
    async getCellData(page: Locator, row: number, col: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let val = await page.locator(_locator).nth(row).locator('td').nth(col).innerText();
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
     */
    async getRowData(page: Locator, row: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let arr = await page.locator(_locator).nth(row).allInnerTexts();
        return arr;
    }

    async getRowDataAsArray(page: Locator, row: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let aRow = await page.locator(_locator).nth(row);
        let arr = new Array();
        let columnLenth = await aRow.locator('td').count();
        for (let index = 0; index < columnLenth; index++) {
            let data = await (await aRow.locator('td').nth(index).innerText()).toString();
            arr.push(data);
        }
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
     */
    async getAllRowsColumnData(page: Locator, column: number, options?: { locator?: string, numberofRows?: number }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _numberofRows = options?.numberofRows?.valueOf() === undefined ? 0 : options?.numberofRows;

        let arr: string[] = []; // Specify the type of arr as string[]
        let actualLength = await page.locator(_locator).count();
        let length = _numberofRows === 0 ? actualLength : actualLength < _numberofRows ? actualLength : _numberofRows;
        for (let index = 0; index < length; index++) {
            let text = await page.locator(_locator).nth(index).locator('td').nth(column).innerText();
            arr.push(text);
        }
        return arr;

    }



    /**
     * The function retrieves the inner texts of all th elements within a specified element and returns
     * them as an array.
     * @returns an array of header names.
     */
    async getHeaderNames(page: Locator) {
        let arr = await page.locator('th').allInnerTexts();
        return arr;
    }


    /**
     * The function `getRow` retrieves a specific row element from a table based on the given index and
     * optional locator.
     * @param {number} index - The index parameter is a number that represents the position of the row
     * you want to retrieve. It is used to specify which row to select from a table or list of rows.
     * @param [options] - The `options` parameter is an optional object that can contain the following
     * properties:
     * @returns a Promise that resolves to the current instance of the object.
     */
    async getRow(page: Locator, index: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let ele = await page.locator(_locator).nth(index);
        return ele;
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
     */
    async getHederColumnNumber(page: Locator, colName: string, exactMatch = false) {
        const innerTextArr = await (await page).locator('th').allInnerTexts();
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
     */
    async getHeaderName(page: Locator, index: number) {
        let text = await (await page).locator('th').nth(index).innerText();
        return text;
    }



    /**
     * The function `getMetaTableRowsLength` returns the number of rows in a table element.
     * @param [options] - An optional object that can contain the following properties:
     * @returns the length of the table rows that match the specified locator.
     */
    async getMetaTableRowsLength(page: Locator, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let length = Number(await (await page.locator(' tr')).locator(_locator).count());
        return length;

    }

    async getColumnLength(page: Locator, rowIndex?: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let rowI = rowIndex ?? 0;
        let length = Number(await page.locator(_locator).nth(rowI).locator('td').count());
        return length;
    }

    async getRowColumn(page: Locator, rowIndex: number, columnIndex: number, options?: { locator?: string }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let rowColumn = await page.locator(_locator).nth(rowIndex).locator('td').nth(columnIndex);
        return rowColumn;
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
     */
    async getMatchedRowIndex(page: Locator, rowValues: string[], options?: { locator?: string, exactMatch?: boolean }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        let arr = new Array();
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim().includes(`'`) ? ele.trim().split(`'`)[1] : ele.trim();
        });


        await page.locator(_locator).nth(0).waitFor();
        const rows = await page.locator(_locator).count();
        for (let index = 0; index < rows; index++) {
            const table_data = await page.locator(_locator).nth(index).allInnerTexts();
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
        if (row_index >= 0) {
            return row_index;
        }
        return -1;
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
     */
    async getMatchedRowIndices(page: Locator, rowValues: string[], options?: { locator?: string, exactMatch?: boolean }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim().includes(`'`) ? ele.trim().split(`'`)[1] : ele.trim();
        })
        let foundIndices = new Array();

        const nRows = await page.count()
        for (let index = 0; index < nRows; index++) {
            await (await page.locator(_locator).nth(index).allInnerTexts().then(async (row_text) => {
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
     */
    async getMetaTableMatchedRowIndex(page: Locator, rowValues: string[], options?: { locator?: string, exactMatch?: boolean }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        let arr = new Array();
        await page.locator(_locator).nth(0).waitFor();
        rowValues.forEach((ele, i) => {
            rowValues[i] = ele.trim();
        })
        const rows = await page.locator(_locator).count();
        for (let index = 0; index < rows; index++) {
            const table_data = await (await page.locator(_locator).nth(index).allInnerTexts());
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
        if (row_index >= 0) {
            return row_index;
        }
        return -1;

    }

    async getMetaTableMatchedRowIndices(page: Locator, rowValues: string[], options?: { locator?: string, exactMatch?: boolean, minColumnSize: number }) {
        let _locator = options?.locator?.valueOf() === undefined ? 'tr' : options?.locator;
        let _exactMatch = options?.exactMatch?.valueOf() === undefined ? false : options?.exactMatch;
        let _minColumnSize = options?.minColumnSize?.valueOf() === undefined ? 1 : options?.minColumnSize;
        console.log('Recieved data : ' + rowValues);
        let arr = new Array();
        let foundIndices = new Array();


        let rows = await page.locator(_locator).all();
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

    async isExist(page: Locator, locactor: any) {
        let totalObjs = await page.locator(locactor).all();
        let flag = totalObjs.length > 0;
        return flag;
    }

}
