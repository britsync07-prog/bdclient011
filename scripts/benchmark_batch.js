const path = require('path');
const { spawn } = require('child_process');

process.env.DATABASE_URL = 'file:/app/server/prisma/dev.db';
process.env.OROPLAY_CLIENT_ID = 'RSU2';
process.env.OROPLAY_CLIENT_SECRET = 'UoHxygREc2f238EbEBYxEjMR3xoZJP55';
process.env.JWT_SECRET = 'your_jwt_secret_here';
process.env.PORT = 5003;

const BACKEND_URL = 'http://localhost:5003';
const AUTH_HEADER = 'Basic ' + Buffer.from(process.env.OROPLAY_CLIENT_ID + ':' + process.env.OROPLAY_CLIENT_SECRET).toString('base64');

let backendProcess = null;

async function startServer() {
  console.log('Starting server...');
  backendProcess = spawn('node', ['server/src/server.js'], {
    env: process.env
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  // Wait for server to be ready
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({ userCode: 'admin' })
      });
      if (res.status === 200) {
        console.log('Server is ready');
        return;
      } else {
         console.log(`Server responded with status: ${res.status}`);
      }
    } catch (e) {
      console.log(`Waiting for server... ${e.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Server failed to start');
}

function stopServer() {
  if (backendProcess) {
    backendProcess.kill();
  }
}

async function runBenchmark(label) {
  const numTransactions = 200;
  const transactions = [];
  for (let i = 0; i < numTransactions; i++) {
    transactions.push({
      transactionCode: 'bench_' + label + '_' + Date.now() + '_' + i,
      amount: "1.00"
    });
  }

  const start = Date.now();
  const res = await fetch(`${BACKEND_URL}/api/batch-transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH_HEADER
    },
    body: JSON.stringify({
      userCode: 'admin',
      transactions
    })
  });
  const end = Date.now();

  const data = await res.json();
  if (data.success) {
    console.log(`Success! Time taken (${label}): ${end - start}ms`);
    return end - start;
  } else {
    console.error('Benchmark failed:', data);
    return null;
  }
}

async function main() {
  try {
    await startServer();
    // Warm up
    await runBenchmark('warmup');
    // Actual measurement
    console.log('--- Actual Measurement ---');
    const times = [];
    for (let i = 0; i < 5; i++) {
        const t = await runBenchmark('run_' + i);
        if (t !== null) times.push(t);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Average time: ${avg.toFixed(2)}ms`);
  } catch (error) {
    console.error(error);
  } finally {
    stopServer();
    process.exit(0);
  }
}

main();
