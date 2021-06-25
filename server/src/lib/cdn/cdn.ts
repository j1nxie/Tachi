import fs from "fs";
import path from "path";
import { KTCDN_ROOT } from "../setup/config";
import CreateLogCtx from "../logger/logger";
import { promisify } from "util";
import mkdirp from "mkdirp";

const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);
const rmFilePromise = promisify(fs.rm);

const logger = CreateLogCtx(__filename);

/**
 * Joins a file location against the location of the CDN static store.
 */
function CDNRoot(fileLoc: string) {
	return path.join(KTCDN_ROOT, fileLoc);
}

/**
 * Retrieves the data of the file at the given CDN location.
 */
export function CDNRetrieve(fileLoc: string) {
	logger.debug(`Retrieving path ${fileLoc}.`);

	return readFilePromise(CDNRoot(fileLoc));
}

/**
 * Flag for fs.open to write a file but NOT overwrite it if it already exists.
 */
const WRITE_NO_OVERWRITE = "wx";

/**
 * Stores the provided buffer or string as a file at the given location.
 * @returns Nothing on success. Throws on error.
 */
export async function CDNStore(fileLoc: string, data: Buffer | string) {
	logger.debug(`Storing path ${fileLoc}.`);

	const loc = CDNRoot(fileLoc);

	// make the parent folders if they dont exist. else, mkdirp is a no-op.
	await mkdirp(path.dirname(loc));

	return writeFilePromise(loc, data, { flag: WRITE_NO_OVERWRITE });
}

/**
 * Stores a file at fileLoc. If it already exists, overwrite it.
 */
export async function CDNStoreOrOverwrite(fileLoc: string, data: Buffer | string) {
	logger.debug(`Storing or overwriting path ${fileLoc}.`);

	const loc = CDNRoot(fileLoc);

	// make the parent folders if they dont exist. else, mkdirp is a no-op.
	await mkdirp(path.dirname(loc));

	return writeFilePromise(loc, data);
}

/**
 * Removes a file at this CDN location.
 */
export function CDNDelete(fileLoc: string) {
	logger.verbose(`Deleting path ${fileLoc}.`);

	const loc = CDNRoot(fileLoc);

	return rmFilePromise(loc, { force: true });
}
