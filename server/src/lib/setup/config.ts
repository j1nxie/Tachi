// barrel file for re-exporting env variables.
import dotenv from "dotenv";
import JSON5 from "json5";
import fs from "fs";
import p from "prudence";
import { FormatPrError } from "../../utils/prudence";
import { integer, StaticConfig } from "tachi-common";
dotenv.config(); // imports things like NODE_ENV from a local .env file if one is present.

// stub - having a real logger here creates a circular dependency.r
const logger = console; // CreateLogCtx(__filename);

// reads from $pwd/conf.json5
let confFile;

try {
	confFile = fs.readFileSync("./conf.json5", "utf-8");
} catch (err) {
	logger.error("Error while trying to open conf.json5. Is one present?", { err });
	process.exit(1);
}

const config = JSON5.parse(confFile);

function isValidURL(self: unknown) {
	if (typeof self !== "string") {
		return `Expected URL, received type ${typeof self}`;
	}

	try {
		new URL(self);
		return true;
	} catch (err) {
		return `Invalid URL ${self}.`;
	}
}

export interface TachiConfig {
	MONGO_CONNECTION_URL: string;
	MONGO_DATABASE_NAME: string;
	LOG_LEVEL: "debug" | "verbose" | "info" | "warn" | "error" | "severe" | "crit";
	CAPTCHA_SECRET_KEY: string;
	SESSION_SECRET: string;
	FLO_API_URL: string;
	EAG_API_URL: string;
	ARC_API_URL: string;
	ARC_AUTH_TOKEN: string;
	CDN_ROOT: string;
	CDN_URL?: string | null;
	TYPE: "ktchi" | "btchi" | "omni";
	PORT: integer;
	CLIENT_INDEX_HTML_PATH: string;
	TYPE_INFO: StaticConfig.ServerConfig;
}

const err = p(config, {
	MONGO_CONNECTION_URL: "string",
	MONGO_DATABASE_NAME: "string",
	LOG_LEVEL: p.isIn("debug", "verbose", "info", "warn", "error", "severe", "crit"),
	CAPTCHA_SECRET_KEY: "string",
	SESSION_SECRET: "string",
	FLO_API_URL: isValidURL,
	EAG_API_URL: isValidURL,
	ARC_API_URL: isValidURL,
	ARC_AUTH_TOKEN: "string",
	CDN_ROOT: "string",
	CDN_URL: p.nullable(p.optional(isValidURL)),
	PORT: p.isPositiveInteger,
	CLIENT_INDEX_HTML_PATH: "string",
	TYPE: p.isIn("ktchi", "btchi", "omni"),
});

if (err) {
	throw FormatPrError(err, "Invalid conf.json5 file.");
}

if (config.TYPE === "ktchi") {
	config.TYPE_INFO = StaticConfig.KTCHI_CONFIG;
} else if (config.TYPE === "btchi") {
	config.TYPE_INFO = StaticConfig.BTCHI_CONFIG;
} else if (config.TYPE === "omni") {
	config.TYPE_INFO = StaticConfig.OMNI_CONFIG;
}

const tachiConfig = config as TachiConfig;

// note: we dont use fs.exists here because the file may be moved underfoot.
try {
	fs.readFileSync(config.CLIENT_INDEX_HTML_PATH);
} catch (err) {
	logger.error(`Error while opening file at CLIENT_INDEX_HTML_PATH. Is one here?`);
	process.exit(1);
}

export const MONGO_CONNECTION_URL = tachiConfig.MONGO_CONNECTION_URL;
export const MONGO_DATABASE_NAME = tachiConfig.MONGO_DATABASE_NAME;
export const LOG_LEVEL = tachiConfig.LOG_LEVEL;
export const SESSION_SECRET = tachiConfig.SESSION_SECRET;
export const CAPTCHA_SECRET_KEY = tachiConfig.CAPTCHA_SECRET_KEY;
export const FLO_API_URL = tachiConfig.FLO_API_URL;
export const EAG_API_URL = tachiConfig.EAG_API_URL;
export const ARC_API_URL = tachiConfig.ARC_API_URL;
export const ARC_AUTH_TOKEN = tachiConfig.ARC_AUTH_TOKEN;
export const CDN_ROOT = tachiConfig.CDN_ROOT;
export const CDN_URL = tachiConfig.CDN_URL;
export const CONF_INFO = tachiConfig.TYPE_INFO;
export const PORT = tachiConfig.PORT;
export const CONFIG = tachiConfig;
export const CLIENT_INDEX_HTML_PATH = config.CLIENT_INDEX_HTML_PATH;
