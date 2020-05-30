// pattern described here:
// - https://zeit.co/guides/deploying-a-mongodb-powered-api-with-node-and-now
const mongoose = require("mongoose");
const config = require("../config");

// mongoose.set("useFindAndModify", false);

let cachedDb = null;

async function connectToDatabase(uri) {
  if (cachedDb) {
    console.log("CACHING ENABLED");
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const db = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  // Cache the database connection and return the connection
  cachedDb = db;
  return db;
}

exports.connect = async () => {
  await connectToDatabase(config.paMongoDBUri);
};
