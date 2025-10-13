"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetMatchDetails = makeGetMatchDetails;
const prisma_match_repository_1 = require("../repositories/prisma/prisma-match-repository");
const get_match_details_1 = require("../use-cases/get-match-details");
function makeGetMatchDetails() {
    return new get_match_details_1.GetMatchDetailsUseCase(new prisma_match_repository_1.PrismaMatchRepository());
}
