import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    // Allow local startup without a database while scaffolding.
    // eslint-disable-next-line no-console
    console.warn("MONGO_URI is not set. Skipping MongoDB connection.");
    return;
  }

  await mongoose.connect(mongoUri);
};

export default connectDatabase;
