# Original User Request

## 2026-06-07T14:43:59Z

You are the E2E Testing Track Orchestrator. Your working directory is `/home/saimon/grp/gamble/.agents/e2e_testing_orch`.
Your task is to implement the E2E Testing Track for the PBBET iGaming Platform Overhaul, according to `/home/saimon/grp/gamble/PROJECT.md` and the user requirements.

Specifically:
1. Initialize your briefing, progress, and SCOPE.md files in your working directory.
2. Build a mock OroPlay server or simulated test harness that maps all 20 OroPlay integration APIs (e.g. status, gamesList, gameLaunchUrl, userCreate, userDeposit, etc.) and simulates transactional calls (balance, transaction, batch-transactions) with Basic Auth.
3. Establish a programmatic verification test suite following the 4-tier system:
   - Tier 1: Feature coverage (happy-path tests for each of the main features)
   - Tier 2: Boundary & corner cases (handling zero/negative balances, invalid users, overflow amounts, basic auth failure)
   - Tier 3: Cross-feature combinations (multiple bets, bets followed by wins, deposit followed by bet, etc.)
   - Tier 4: Real-world application workloads (simulating user signup, deposits, multiple game plays, balance updates, and final balance retrieval)
4. Ensure the test suite can execute programmatically and does not hit rate limits.
5. Create `TEST_INFRA.md` in the workspace root mapping the test philosophy, inventory, and architecture.
6. Generate `TEST_READY.md` in the workspace root once the test suite is fully complete and functional.

When complete, write your handoff.md and send me a message. You must delegate execution to worker/challenger subagents. DO NOT write code yourself. Include the MANDATORY INTEGRITY WARNING in all worker prompts:
"DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work."
