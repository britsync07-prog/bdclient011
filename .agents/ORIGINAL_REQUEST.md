# Original User Request

## Initial Request — 2026-06-07T14:26:46Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Redesign the full frontend of an iGaming platform using the `stitch` MCP server, with a bright color palette (no dark/purple). Integrate real-time OroPlay APIs, set up an admin panel for dynamic placeholders, test for production readiness, and generate a brief detailing the system architecture.

Working directory: /home/saimon/grp/gamble
Integrity mode: development

## Requirements

### R1. Frontend Redesign with Stitch MCP
Redesign every page of the existing Next.js frontend using the `stitch` MCP tools. The design must be bright and vibrant, strictly avoiding black, dark, or purple colors.

### R2. Backend & API Integration
Remove all dummy data. Wire up the frontend to consume the real backend APIs, including the OroPlay integration APIs (Seamless Wallet, Balance Transfer, Game Lists, etc.). 

### R3. Admin Panel Setup
Provide an admin panel with options to update dynamic placeholders across the site (e.g., social media links, about sections).

### R4. Testing and Documentation
Set up a mock API server or simulated test suite that safely simulates OroPlay transactions to verify that the backend integrations are fully working. Output a comprehensive `briefing.txt` file summarizing the website structure, APIs, user signup process, and admin functionalities.

## Acceptance Criteria

### Verification & Production Readiness
- [ ] A mock API test suite successfully simulates transactions and validates the OroPlay API integrations programmatically without hitting rate limits.
- [ ] The frontend design is completely overhauled without dark/purple colors.
- [ ] All games, betting histories, and wallet balances fetch data from the backend APIs rather than static placeholders.
- [ ] Modifying data in the admin panel programmatically updates the public-facing site values.
- [ ] `briefing.txt` exists in the workspace root and accurately documents the system workflow.
