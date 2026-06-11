const prisma = require('./config/db');
const fs = require('fs').promises;
const path = require('path');

async function verify() {
  console.log('--- Phase 3 Verification ---');

  const artifacts = [
    'src/middleware/walletAuthMiddleware.js',
    'src/controllers/walletController.js',
    'src/routes/walletRoutes.js'
  ];

  // Parallelize I/O operations
  const [artifactExists, appContent, middlewareContent] = await Promise.all([
    Promise.all(artifacts.map(async (artifactPath) => {
      try {
        const relativePath = './' + artifactPath.replace('src/', '');
        const absolutePath = path.resolve(__dirname, relativePath);
        await fs.access(absolutePath);
        return { path: artifactPath, exists: true };
      } catch (e) {
        return { path: artifactPath, exists: false };
      }
    })),
    fs.readFile(path.join(__dirname, 'app.js'), 'utf8').catch(() => null),
    fs.readFile(path.join(__dirname, 'middleware', 'walletAuthMiddleware.js'), 'utf8').catch(() => null)
  ]);

  // 1. Check artifacts
  for (const result of artifactExists) {
    if (result.exists) {
      console.log(`✓ Artifact exists: ${result.path}`);
    } else {
      console.error(`✗ Artifact missing: ${result.path}`);
    }
  }

  // 2. Check wiring in app.js
  if (appContent) {
    if (appContent.includes("require('./routes/walletRoutes')") && appContent.includes("app.use('/api', walletRoutes)")) {
      console.log('✓ Wallet routes wired in app.js');
    } else {
      console.error('✗ Wallet routes NOT wired in app.js');
    }
  } else {
    console.error('✗ Failed to read app.js');
  }

  // 3. Check controller for business logic
  try {
    const controller = require('./controllers/walletController');
    if (controller.getBalance && controller.handleTransaction && controller.handleBatchTransactions) {
      console.log('✓ Controller exports all required methods');
    } else {
      console.error('✗ Controller missing methods');
    }
  } catch (e) {
    console.error('✗ Failed to require controller');
  }

  // 4. Check middleware for auth logic
  if (middlewareContent) {
    if (middlewareContent.includes('Authorization') && middlewareContent.includes('Basic')) {
      console.log('✓ Middleware implements Basic Auth check');
    } else {
      console.error('✗ Middleware missing auth logic');
    }
  } else {
    console.error('✗ Failed to read middleware');
  }

  console.log('--- Verification Complete ---');
  // Removed process.exit(0) to allow potential programmatic usage if needed,
  // although this is primarily a CLI script.
}

if (require.main === module) {
  verify().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = verify;
