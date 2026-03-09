

/**
 * Ensures a folder exists; creates it recursively when missing.
 *
 * @example
 * await checkFolderAndCreate("./logs/run-001");
 */
export async function checkFolderAndCreate(folder: string) {
    let fs = require("fs");
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
}

/**
 * Writes JSON data to a file with pretty formatting.
 *
 * Details:
 * - Overwrites existing file content (`flag: 'w'`).
 * - Uses 2-space indentation.
 *
 * @example
 * await writeJsonData("./output/result.json", { status: "ok" });
 */
export async function writeJsonData(filePath: string, data: any) {
    let fs = require("fs");
    await fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { flag: 'w' }, 'utf-8');
}

/**
 * Reads and parses a JSON file.
 *
 * @example
 * const payload = await readJsonData("./output/result.json");
 */
export async function readJsonData(filePath: string) {
    let fs = require("fs");
    return await JSON.parse(fs.readFileSync(filePath))
}

/**
 * Reads a file as raw data (Buffer by default).
 *
 * @example
 * const bytes = await readData("./artifacts/screenshot.png");
 */
export async function readData(filePath: string) {
    let fs = require("fs");
    const data = await fs.readFileSync(filePath);
    return data;

}

/**
 * Checks whether a file or path exists.
 *
 * @example
 * const exists = await isfileExist("./output/result.json");
 */
export async function isfileExist(filepath: string) {
    let fs = require("fs");
    return fs.existsSync(filepath);
}



/**
 * Returns all file/folder names from a directory.
 *
 * @example
 * const names = await getFileNamesFromDir("./reports");
 */
export async function getFileNamesFromDir(dirPath: string) {
    let fs = require("fs");
    let array = new Array();
    await fs.readdirSync(dirPath).forEach((fileName: string) => {
        array.push(fileName);
    })
    return array;
}

/**
 * Returns names from a directory that include the provided substring.
 *
 * @example
 * const reportFiles = await getFullFileNames("./reports", ".json");
 */
export async function getFullFileNames(dirPath: string, fileNameSubString: string) {
    let fs = require("fs");
    let array: string[] = []; // Initialize array as an empty array
    await fs.readdirSync(dirPath).forEach((fileName?: string) => {
        if (fileName?.includes(fileNameSubString)) {
            array?.push(fileName);
        }
    })
    return array;
}

/**
 * Ensures a directory exists and empties its content.
 *
 * @example
 * await makeEmptyFolder("./temp");
 */
export async function makeEmptyFolder(dirPath: string) {
    const fse = require("fs-extra");
    try {
        fse.ensureDir(dirPath);
        fse.emptyDir(dirPath);

    } catch (error) {
        console.log("Folder not created! " + error);
    }
}
