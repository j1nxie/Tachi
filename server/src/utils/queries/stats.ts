import db from "external/mongo/db";
import { ONE_HOUR } from "lib/constants/time";
import NodeCache from "node-cache";
import type { Game, gameClasses, IDStrings, Playtype } from "tachi-common";

const classDistCache = new NodeCache();

export async function GetClassDistribution(
	game: Game,
	playtype: Playtype,
	className: gameClasses.GameClassSets[IDStrings]
) {
	const cacheKey = `${game}:${playtype}:${className}`;
	const cache = classDistCache.get(cacheKey);

	if (!cache) {
		const distribution = await db["game-stats"].aggregate([
			{
				$match: {
					game,
					playtype,
				},
			},
			{
				$group: {
					_id: `$classes.${className}`,
					count: { $sum: 1 },
				},
			},
		]);

		// Converts {_id: "kaiden", count: 3} to {"kaiden": 3}, more or less.
		const convert = Object.fromEntries(distribution.map((e) => [e._id, e.count]));

		classDistCache.set(cacheKey, convert, ONE_HOUR);

		return convert;
	}

	return cache;
}
