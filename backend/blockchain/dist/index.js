"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = 3020;
// Charger ABI + bytecode du contrat compilé
const contractPath = path_1.default.join(__dirname, "../artifacts/contracts/Tournament.sol/Tournament.json");
const contractJson = JSON.parse(fs_1.default.readFileSync(contractPath, "utf8"));
const abi = contractJson.abi;
const bytecode = contractJson.bytecode;
// Connexion à la blockchain
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.FUJI_RPC_URL);
const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
// Instance de contrat (sera définie après déploiement)
let contract = null;
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const storagePath = path_1.default.join(__dirname, "../contracts/contract.json");
app.post("/deploy", async (req, res) => {
    try {
        const { addresses, nicknames, ranks, points, name } = req.body;
        const factory = new ethers_1.ethers.ContractFactory(abi, bytecode, wallet);
        const deployed = await factory.deploy(addresses, nicknames, ranks, points);
        await deployed.waitForDeployment();
        const contractAddress = await deployed.getAddress();
        // Lire JSON existant
        let data = { tournaments: [] };
        if (fs_1.default.existsSync(storagePath)) {
            data = JSON.parse(fs_1.default.readFileSync(storagePath, "utf8"));
        }
        // Ajouter un nouveau tournoi
        data.tournaments.push({
            name: name || `Tournament-${Date.now()}`,
            address: contractAddress,
            network: "fuji"
        });
        // Sauvegarder dans contract.json
        fs_1.default.writeFileSync(storagePath, JSON.stringify(data, null, 2));
        res.json({ contractAddress });
    }
    catch (error) {
        console.error("Deploy error:", error);
        res.status(500).json({
            error: error.message || JSON.stringify(error)
        });
    }
});
app.get("/players/:name", async (req, res) => {
    try {
        const data = JSON.parse(fs_1.default.readFileSync(storagePath, "utf8"));
        const tournament = data.tournaments.find((t) => t.name === req.params.name);
        if (!tournament)
            throw new Error("Tournament not found");
        const contract = new ethers_1.ethers.Contract(tournament.address, abi, provider);
        const players = await contract.getAllPlayers();
        const formatted = players.map((p) => ({
            nickname: p.nickname,
            rank: p.rank.toString(),
            points: p.points.toString()
        }));
        res.json(formatted);
    }
    catch (error) {
        console.error("Players error:", error);
        res.status(500).json({
            error: error.message || JSON.stringify(error)
        });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
});
