import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  
  if (uri) {
    try {
      console.log(`Attempting connection to primary MongoDB Atlas...`);
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB connected to Atlas: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (error) {
      const err = error as Error;
      console.warn(`⚠️ Primary MongoDB Atlas connection failed (likely whitelisting issue): ${err.message}`);
    }
  }

  try {
    const localUri = 'mongodb://127.0.0.1:27017/comparewise';
    console.log(`Attempting fallback connection to local MongoDB: ${localUri}...`);
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB connected to local fallback: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Fallback MongoDB connection failed: ${err.message}`);
    console.warn(`⚠️ Running in database-offline fallback mode. authentication features will use local in-memory storage.`);
  }
};

export default connectDB;
