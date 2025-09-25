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
let blogCollection;


async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(process.env.DB_NAME);
    userCollection = db.collection("users");
    policyCollection = db.collection("policies");
    blogCollection = db.collection("blogs");

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







//-----------------policy routes------------------//


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




// ---------------- user Routes ---------------- //

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




// get all users

app.get("/api/get-users", async(req,res)=>{

  try {
    const users = await userCollection.find().toArray();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
})


// Update user role
app.put("/api/update-user-role/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const result = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    res.json({ success: true, message: "Role updated", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete user
app.delete("/api/delete-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userCollection.deleteOne({ _id: new ObjectId(userId) });

    res.json({ success: true, message: "User deleted", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});





// ---------------- Blogs Routes ---------------- //

app.get("/api/get-blogs", async (req, res) => {
  try {
    const blogs = await blogCollection.find().toArray();
    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// get blog by id
app.get("/api/get-blogs", async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;

    const blogs = await blogCollection.find(query).toArray();
    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// create blog 


app.post("/api/create-blog", async (req, res) => {
  try {
    const result = await blogCollection.insertOne(req.body);
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// update blog 

app.put("/api/update-blog/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    const result = await blogCollection.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: req.body }
    );
    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// delete blog 

app.delete("/api/delete-blog/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    const result = await blogCollection.deleteOne({ _id: new ObjectId(blogId) });
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});