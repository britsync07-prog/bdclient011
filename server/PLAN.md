---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified:
  - server/src/utils/oroplayApi.js
  - server/src/controllers/userController.js
  - server/src/routes/userRoutes.js
  - server/src/controllers/adminController.js
autonomous: true
must_haves:
  truths:
    - "OroPlay utility has getVendors, getGames, and getLaunchUrl methods"
    - "User controller has getGames and launchGame methods"
    - "User routes have GET /games and POST /launch endpoints"
    - "Launch URL request uses logged-in user's username as userCode"
  artifacts:
    - "server/src/utils/oroplayApi.js updated"
    - "server/src/controllers/userController.js updated"
    - "server/src/routes/userRoutes.js updated"
---

# Plan 1.1: OroPlay Secure Game Integration

<objective>
Update the PBBET Backend to include secure game fetching and launching via OroPlay API v2.
</objective>

<context>
- server/src/utils/oroplayApi.js
- server/src/controllers/userController.js
- server/src/routes/userRoutes.js
- server/src/controllers/adminController.js
</context>

<tasks>

<task type="auto">
  <name>Update OroPlay Utility</name>
  <files>server/src/utils/oroplayApi.js</files>
  <action>
    Add methods:
    - getVendors(): GET /vendors/list
    - getGames(vendorCode, language = 'en'): POST /games/list
    - getLaunchUrl(payload): POST /game/launch-url
    Ensure all methods use getBearerToken() for authentication.
  </action>
  <verify>Check file content for new methods</verify>
  <done>Methods getVendors, getGames, and getLaunchUrl are implemented and exported.</done>
</task>

<task type="auto">
  <name>Implement User Controller Methods</name>
  <files>server/src/controllers/userController.js</files>
  <action>
    Add methods:
    - getGames: Fetches vendors, then aggregates games from all vendors using oroplayApi.
    - launchGame: Receives gameCode and vendorCode from req.body, uses req.user.username as userCode, and calls oroplayApi.getLaunchUrl.
  </action>
  <verify>Check file content for getGames and launchGame exports</verify>
  <done>User controller has getGames and launchGame logic implemented.</done>
</task>

<task type="auto">
  <name>Configure User Routes</name>
  <files>server/src/routes/userRoutes.js</files>
  <action>
    Add endpoints:
    - GET /games: Protected route using getGames controller.
    - POST /launch: Protected route using launchGame controller.
  </action>
  <verify>Check userRoutes.js for new endpoints</verify>
  <done>Endpoints GET /games and POST /launch are registered with protect middleware.</done>
</task>

<task type="auto">
  <name>Verify Admin Controller setGameRTP</name>
  <files>server/src/controllers/adminController.js</files>
  <action>
    Ensure setGameRTP uses oroplayApi.setUserRTP as currently implemented, and it aligns with the API (POST /game/user/set-rtp). The current implementation seems correct based on the PDF.
  </action>
  <verify>Check adminController.js setGameRTP implementation</verify>
  <done>setGameRTP is confirmed to be correctly using the utility.</done>
</task>

</tasks>

<verification>
- [ ] oroplayApi.js has getVendors, getGames, getLaunchUrl
- [ ] userController.js has getGames, launchGame
- [ ] userRoutes.js has /games and /launch endpoints
- [ ] Launch URL payload includes userCode from req.user.username
</verification>

<success_criteria>
- All tasks completed and verified
- Backend supports game listing and launching via OroPlay
</success_criteria>
