const mongoose = require("mongoose");

async function connectTestDatabase() {
  await mongoose.connect("mongodb://localhost:27017/waygood-test");
}

async function closeTestDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  connectTestDatabase,
  closeTestDatabase,
  clearCollections,
};