const mongoose = require('mongoose');
const env = require('./env');

let memoryServer;

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    if (env.nodeEnv === 'production') {
      throw error;
    }

    console.warn(`MongoDB at ${env.mongoUri} unavailable (${error.message}). Starting in-memory database.`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 60000 },
    });
    const uri = memoryServer.getUri('skybook');
    await mongoose.connect(uri);
    console.log('In-memory MongoDB started for local development.');
    return mongoose.connection;
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDatabase, disconnectDatabase };
