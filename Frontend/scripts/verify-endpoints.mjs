import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/lib/oroplay.ts", import.meta.url), "utf-8");

const required = [
  "status",
  "vendorsList",
  "gamesList",
  "gameDetail",
  "gameLaunchUrl",
  "bettingHistoryById",
  "transactionHistoryById",
  "agentBalance",
  "userCreate",
  "userBalance",
  "userDeposit",
  "userWithdraw",
  "userWithdrawAll",
  "userBalanceHistory",
  "setUserRtp",
  "getUserRtp",
  "resetUsersRtp",
  "bettingHistoryByDateV2",
  "bettingHistoryDetailPage",
  "batchUsersRtp",
];

const missing = required.filter((name) => !source.includes(`${name}:`));
if (missing.length > 0) {
  console.error("Missing endpoints:", missing.join(", "));
  process.exit(1);
}

console.log(`Endpoint coverage OK: ${required.length}/20 integration endpoints mapped.`);
