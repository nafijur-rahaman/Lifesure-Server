require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleware/verifyJWT");
const JWT_SECRET = process.env.JWT_SECRET;

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
  },
});

let userCollection;
let policyCollection;
let blogCollection;
let applicationCollection;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(process.env.DB_NAME);
    userCollection = db.collection("users");
    policyCollection = db.collection("policies");
    blogCollection = db.collection("blogs");
    applicationCollection = db.collection("applications");

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

// login for retrieve jwt token

app.post("/api/login", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  const payload = { email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ success: true, message: "Login successful", token });
});

//-----------------policy routes------------------//

//create new polices

app.post("/api/create-polices", async (req, res) => {
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
});

// update policy

app.put("/api/update-policy/:id", async (req, res) => {
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
});

// get all policies

app.get("/api/get-policies", verifyJWT, async (req, res) => {
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

//get policy by id

app.get("/api/get-policy/:id", async (req, res) => {
  try {
    const policyId = req.params.id;
    const policy = await policyCollection.findOne({
      _id: new ObjectId(policyId),
    });
    res.status(200).json({
      success: true,
      message: "Policy fetched successfully",
      data: policy,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// delete policy

app.delete("/api/delete-policy/:id", async (req, res) => {
  try {
    const policyId = req.params.id;
    const result = await policyCollection.deleteOne({
      _id: new ObjectId(policyId),
    });
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

app.get("/api/get-users", async (req, res) => {
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
});

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
    const result = await userCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    res.json({ success: true, message: "User deleted", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// get just agent user 

app.get("/api/get-agent-users", async (req, res) => {
  try {
    const users = await userCollection.find({ role: "agent" }).toArray();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
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
    const result = await blogCollection.deleteOne({
      _id: new ObjectId(blogId),
    });
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- Application Routes ---------------- //

//get all submitted application

app.get("/api/applications", async (req, res) => {
  try {
    const applications = await applicationCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch policies for each application
    const applicationsWithPolicy = await Promise.all(
      applications.map(async (app) => {
        if (!app.policy_id) return app;

        const policy = await policyCollection.findOne({ _id: new ObjectId(app.policy_id) });
        return { ...app, policyInfo: policy }; 
      })
    );

    res.status(200).json({ success: true, data: applicationsWithPolicy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Update application set agent
app.patch("/api/application/:id/assign-agent", async (req, res) => {
  try {
    const { id } = req.params;
    const { agent } = req.body;

    if (!agent) {
      return res
        .status(400)
        .json({ success: false, message: "Agent is required" });
    }

    const result = await applicationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { agent } }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Agent assigned successfully",
    });
  } catch (err) {
    console.error("Error assigning agent:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//submit application

app.post("/api/submit-application", async (req, res) => {
  try {
    const {
      name,
      email,
      address = "",
      nid = "",
      phone,
      nomineeName = "",
      nomineeRelation = "",
      health = [],
      policy_id = null,
    } = req.body;

    // Basic required validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Phone are required.",
      });
    }

    const newApplication = {
      name,
      email,
      address,
      nid,
      phone,
      nomineeName,
      nomineeRelation,
      health,
      policy_id, 
      status: "Pending", // default
      agent: null, // no agent assigned yet
      createdAt: new Date(),
    };

    const result = await applicationCollection.insertOne(newApplication);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { applicationId: result.insertedId },
    });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all applications for a given agent by email
app.get("/api/agent/:agentEmail/applications", async (req, res) => {
  try {
    const { agentEmail } = req.params;

    const applications = await applicationCollection
      .find({ agent: agentEmail }) // match by email
      .sort({ createdAt: -1 })
      .toArray();

    // Attach policy info
    const applicationsWithPolicy = await Promise.all(
      applications.map(async (app) => {
        let policy = null;
        if (app.policy_id) {
          policy = await policyCollection.findOne({
            _id: new ObjectId(app.policy_id),
          });
        }
        return {
          _id: app._id,
          name: app.name,
          email: app.email,
          status: app.status,
          policyInfo: policy
            ? { _id: policy._id, title: policy.title }
            : null,
          createdAt: app.createdAt,
          agent: app.agent, // include agent email
        };
      })
    );

    res.status(200).json({ success: true, data: applicationsWithPolicy });
  } catch (err) {
    console.error("Error fetching agent applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//update status and purchase count

app.patch("/api/agent/application/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Approved", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const application = await applicationCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const prevStatus = application.status;

    // Update status
    await applicationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    // If approved → increment purchase count (only once)
    if (
      status === "Approved" &&
      prevStatus !== "Approved" &&
      application.policy_id
    ) {
      await policyCollection.updateOne(
        { _id: new ObjectId(application.policy_id) },
        { $inc: { purchaseCount: 1 } }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});