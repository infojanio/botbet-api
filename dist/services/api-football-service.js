"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFootballService = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const PROVIDER = process.env.API_PROVIDER || 'official'; // "official" ou "rapidapi"
const API_KEY = process.env.API_KEY;
const API_URL = PROVIDER === 'rapidapi'
    ? 'https://api-football-v1.p.rapidapi.com/v3'
    : 'https://v3.football.api-sports.io';
async function getJson(url) {
    const headers = {};
    if (PROVIDER === 'rapidapi') {
        headers['X-RapidAPI-Key'] = API_KEY;
        headers['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com';
    }
    else {
        headers['x-apisports-key'] = API_KEY;
    }
    const res = await (0, node_fetch_1.default)(url, { headers });
    if (!res.ok)
        throw new Error(`API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.response || [];
}
class ApiFootballService {
    async getUpcomingMatches(limit) {
        return getJson(`${API_URL}/fixtures?next=${limit}`);
    }
    async getHeadToHead(homeId, awayId) {
        return getJson(`${API_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}`);
    }
    async getRecentMatches(teamId, limit) {
        return getJson(`${API_URL}/fixtures?team=${teamId}&last=${limit}`);
    }
    async getOdds(matchId) {
        return getJson(`${API_URL}/odds?fixture=${matchId}`);
    }
}
exports.ApiFootballService = ApiFootballService;
