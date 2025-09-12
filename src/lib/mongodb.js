import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db('emotisense');
  return { db, client };
}

export async function getUserCollection() {
  const { db } = await connectToDatabase();
  return db.collection('users');
}

export async function getLogsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('logs');
}

export async function getPatternsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('patterns');
}

export async function getAnalyticsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('analytics');
}

export async function getAssessmentsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('assessments');
}