require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const admin = require("./firebaseAdmin");
const { verifyToken } = require("./middleware/authMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1e3hmt0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB client setup


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(process.env.DB_NAME);

    console.log(`Connected to MongoDB: ${process.env.DB_NAME}`);

    // Start server only after DB is ready
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
}


run().catch(console.dir);




// ---------------- Routes ---------------- //

app.get("/", (req, res) => {
  res.send("Hello, I am LifeSure!");
});

