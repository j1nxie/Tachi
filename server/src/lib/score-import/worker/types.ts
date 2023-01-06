import type { Parsers } from "../import-types/parsers";
import type { Job } from "bullmq";
import type { ImportDocument, ImportTypes, integer } from "tachi-common";

// Ok so, please hear me out on this one.
// We need a type that removes the last element from an array.
// This is because parser functions have variable signatures, but all
// end with requiring a logger. We don't want to have to pass the logger,
// we just want to pass those other arguments.
type RemoveLast<T extends Array<unknown>> = T extends [...infer RemoveLast, unknown]
	? RemoveLast
	: Array<unknown>;

// Which means we can use generic access to make ParserArguments<"ir/usc">
// A type that returns the paramaters of the parser function bound to
// "ir/usc".
// And then, using RemoveLast, we can remove that logger argument we don't
// want to provide.
export type ParserArguments<I extends ImportTypes> = RemoveLast<Parameters<typeof Parsers[GPT]>>;

// Depending on how you look at it, this is either beautiful
// TypeScript power, or brutal TypeScript abuse...

export interface ScoreImportJobData<I extends ImportTypes> {
	importType: I;
	userID: integer;
	userIntent: boolean;
	importID: string;

	// ...and well, I'm personally on the fence.

	// Parsers can't have a consistent signature -- they need info
	// from different sources! As such, we need to pass the parser
	// arguments in an array, and then it can be respreaded into
	// the parser by the import code.
	parserArguments: ParserArguments<GPT>;
}

export type ScoreImportJob<I extends ImportTypes = ImportTypes> = Job<ScoreImportJobData<GPT>>;

export interface ScoreImportProgress {
	description: string;
}

export type ScoreImportWorkerReturns =
	| {
			success: false;
			statusCode: integer;
			description: string;
	  }
	| {
			success: true;
			importDocument: ImportDocument;
	  };
