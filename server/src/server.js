const env = require('./config/env');
const app = require('./app');
const { connectDatabase } = require('./config/db');
const { startJobs } = require('./jobs/flightStatusJob');
const User = require('./models/User');
const { runSeed } = require('./seed/seed');

async function start() {
  await connectDatabase();
  const users = await User.countDocuments();
  if (users === 0 && env.nodeEnv !== 'production') {
    console.log('Database is empty. Seeding demo data...');
    await runSeed({ clear: true });
  }
  startJobs();

  const server = app.listen(env.port, '127.0.0.1', () => {
    console.log(`SkyBook API listening on http://127.0.0.1:${env.port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Stop the other process using that port, or set PORT in .env, then restart.`
      );
      process.exit(1);
    }
    console.error('Failed to start HTTP server', error);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
