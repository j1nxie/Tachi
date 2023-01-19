import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import db from "external/mongo/db";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { WACCARate } from "rg-stats";
import { FmtNum, GetGrade, WACCA_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";
import type { Game, Playtype, integer } from "tachi-common";

// Wacca has a funny algorithm for rate involving gitadora-style latest chart bonuses,
async function CalculateWACCARate(game: Game, playtype: Playtype, userID: integer) {
	const hotChartIDs = (
		await db.charts.wacca.find({ "data.isHot": true }, { projection: { chartID: 1 } })
	).map((e) => e.chartID);

	const coldChartIDs = (
		await db.charts.wacca.find({ "data.isHot": false }, { projection: { chartID: 1 } })
	).map((e) => e.chartID);

	const best15Hot = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			chartID: { $in: hotChartIDs },
			"calculatedData.rate": { $type: "number" },
		},
		{
			sort: {
				"calculatedData.rate": -1,
			},
			limit: 15,
			projection: {
				"calculatedData.rate": 1,
			},
		}
	);

	const best35Cold = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			chartID: { $in: coldChartIDs },
			"calculatedData.rate": { $type: "number" },
		},
		{
			sort: {
				"calculatedData.rate": -1,
			},
			limit: 35,
			projection: {
				"calculatedData.rate": 1,
			},
		}
	);

	if (best15Hot.length + best35Cold.length === 0) {
		return null;
	}

	return (
		best15Hot.reduce((a, e) => a + e.calculatedData.rate!, 0) +
		best35Cold.reduce((a, e) => a + e.calculatedData.rate!, 0)
	);
}

export const WACCA_IMPL: GPTServerImplementation<"wacca:Single"> = {
	validators: {},
	derivers: {
		grade: ({ score }) => GetGrade(WACCA_GBOUNDARIES, score),
	},
	scoreCalcs: {
		rate: (scoreData, chart) => WACCARate.calculate(scoreData.score, chart.levelNum),
	},
	sessionCalcs: { rate: SessionAvgBest10For("rate") },
	profileCalcs: {
		rate: CalculateWACCARate,
		naiveRate: ProfileSumBestN("rate", 50),
	},
	classDerivers: {
		colour: (ratings) => {
			const rate = ratings.rate;

			if (IsNullish(rate)) {
				return null;
			}

			if (rate >= 2500) {
				return "RAINBOW";
			} else if (rate >= 2200) {
				return "GOLD";
			} else if (rate >= 1900) {
				return "SILVER";
			} else if (rate >= 1600) {
				return "BLUE";
			} else if (rate >= 1300) {
				return "PURPLE";
			} else if (rate >= 1000) {
				return "RED";
			} else if (rate >= 600) {
				return "YELLOW";
			} else if (rate >= 300) {
				return "NAVY";
			}

			return "ASH";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		score: (pb) => FmtNum(pb.scoreData.score),
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				WACCA_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				WACCA_GBOUNDARIES[gradeIndex]!.name
			),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Score",
};
