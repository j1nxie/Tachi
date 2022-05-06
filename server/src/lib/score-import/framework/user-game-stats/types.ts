import type { KtLogger } from "lib/logger/logger";
import type { Game, IDStrings, integer, Playtype } from "tachi-common";
import type { GameClasses } from "tachi-common/js/game-classes";

export type ScoreClasses = Partial<GameClasses<IDStrings>>;

export type ClassHandler = (
	game: Game,
	playtype: Playtype,
	userID: integer,
	ratings: Record<string, number>,
	logger: KtLogger
) => Promise<ScoreClasses> | ScoreClasses | undefined;
