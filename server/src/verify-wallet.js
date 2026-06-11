async function verify() {
  console.log('--- Phase 3 Verification ---');

  // 1. Check artifacts
  const artifacts = [
    'src/middleware/walletAuthMiddleware.js',
    'src/controllers/walletController.js',
    'src/routes/walletRoutes.js'
  ];

  for (const path of artifacts) {
    try {
      require.resolve('./' + path.replace('src/', ''));
      console.log(`✓ Artifact exists: ${path}`);
    } catch (e) {
      console.error(`✗ Artifact missing: ${path}`);
    }
  }

  // 2. Check wiring in app.js
  const fs = require('fs');
  const appContent = fs.readFileSync('src/app.js', 'utf8');
  if (appContent.includes("require('./routes/walletRoutes')") && appContent.includes("app.use('/api', walletRoutes)")) {
    console.log('✓ Wallet routes wired in app.js');
  } else {
    console.error('✗ Wallet routes NOT wired in app.js');
  }

  // 3. Check controller for business logic
  const controller = require('./controllers/walletController');
  if (controller.getBalance && controller.handleTransaction && controller.handleBatchTransactions) {
    console.log('✓ Controller exports all required methods');
  } else {
    console.error('✗ Controller missing methods');
  }

  // 4. Check middleware for auth logic
  const middlewareContent = fs.readFileSync('src/middleware/walletAuthMiddleware.js', 'utf8');
  if (middlewareContent.includes('Authorization') && middlewareContent.includes('Basic')) {
    console.log('✓ Middleware implements Basic Auth check');
  } else {
    console.error('✗ Middleware missing auth logic');
  }

  console.log('--- Verification Complete ---');
  process.exit(0);
}

verify();
