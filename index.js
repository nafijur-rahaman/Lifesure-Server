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


let userCollection;
let policyCollection;


async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(process.env.DB_NAME);
    userCollection = db.collection("users");
    policyCollection = db.collection("policies");

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



// check if user exist or not if not exist then create user

app.post("/api/users", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // check if user already exists
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
        data: existingUser,
      });
    }

    // create new user
    const result = await userCollection.insertOne(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//create new polices

app.post("/api/create-polices", async(req,res)=>{

  const newPolicy = req.body;

  try {
    const result = await policyCollection.insertOne(newPolicy);
    res.status(201).json({
      success: true,
      message: "Policy created successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }


})


// update policy


app.put("/api/update-policy/:id", async(req,res)=>{

  const policyId = req.params.id;
  const updatedPolicy = req.body;

  // console.log(updatedPolicy, policyId);

  try {
    const result = await policyCollection.updateOne(
      { _id: new ObjectId(policyId) },
      { $set: updatedPolicy }
    );
    res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
})



// get all policies


app.get("/api/get-policies", async (req, res) => {
  try {
    const policies = await policyCollection.find().toArray();
    res.status(200).json({
      success: true,
      message: "Policies fetched successfully",
      data: policies,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// delete policy


app.delete("/api/delete-policy/:id", async (req, res) => {
  try {
    const policyId = req.params.id;
    const result = await policyCollection.deleteOne({ _id: new ObjectId(policyId) });
    res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


