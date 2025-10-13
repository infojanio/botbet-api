"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetMatches = makeGetMatches;
const prisma_match_repository_1 = require("../repositories/prisma/prisma-match-repository");
const get_matches_1 = require("../use-cases/get-matches");
function makeGetMatches() {
    return new get_matches_1.GetMatchesUseCase(new prisma_match_repository_1.PrismaMatchRepository());
}
