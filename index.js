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
let reviewCollection;
let transactionsCollection;
let claimCollection;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(process.env.DB_NAME);
    userCollection = db.collection("users");
    policyCollection = db.collection("policies");
    blogCollection = db.collection("blogs");
    applicationCollection = db.collection("applications");
    reviewCollection = db.collection("reviews");
    transactionsCollection = db.collection("transactions");
    claimCollection = db.collection("claims");

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

    // console.log(req.body);

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

// get user info

app.post("/api/user-info", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await userCollection.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Return full user object
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
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

// get blog by user id
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


// get blog by blog id

app.get("/api/get-blog/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await blogCollection.findOne({ _id: new ObjectId(blogId) });
    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// create blog

app.post("/api/create-blog", async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      visited: 0, 
    };

    const result = await blogCollection.insertOne(blogData);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//increment visit count

app.post("/api/increment-visit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await blogCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { visited: 1 } }, // increment by 1
      { returnDocument: "after" } // return updated doc
    );

    if (!result.value) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({
      success: true,
      message: "Visit count incremented",
      data: result.value,
    });
  } catch (err) {
    console.error(err);
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

        const policy = await policyCollection.findOne({
          _id: new ObjectId(app.policy_id),
        });
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
      frequency = "monthly", // default payment frequency
    } = req.body;

    // Basic validation
    if (!name || !email || !phone || !policy_id) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Phone, and Policy ID are required.",
      });
    }

    // Fetch policy
    const policy = await policyCollection.findOne({
      _id: new ObjectId(policy_id),
    });
    if (!policy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    // Create payment object
    const amount = Number(policy.basePremium); // convert string to number
    const payment = {
      status: "Due",
      amount: amount,
      frequency: frequency,
      lastPaymentDate: null,
      nextPaymentDue: new Date(),
    };

    // Create policyDetails object
    const policyDetails = {
      title: policy.title,
      category: policy.category,
      description: policy.description,
      minAge: Number(policy.minAge),
      maxAge: Number(policy.maxAge),
      coverage: Number(policy.coverage),
      duration: Number(policy.duration),
      basePremium: amount,
      image: policy.image,
    };

    // Create application object
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
      status: "Pending",
      agent: null,
      createdAt: new Date(),
      payment, // attach payment info
      policyDetails, // attach policy snapshot
    };

    // Insert into DB
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
          policyInfo: policy ? { _id: policy._id, title: policy.title } : null,
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

// get specific application by id
app.get("/api/get-application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const application = await applicationCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get all applied policies by email

app.get("/api/applied-policies", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    const applications = await applicationCollection
      .find({ email })
      .sort({ createdAt: -1 }) // optional: sort newest first
      .toArray();

    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    console.error("Error fetching applied policies:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// get approved policies for client
app.get("/api/customer/payments", async (req, res) => {
  try {
    const { email } = req.query; // pass user email from frontend

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Fetch all approved applications with payment info
    const applications = await applicationCollection
      .find({ email, status: "Approved" })
      .toArray();

    res.json({ success: true, data: applications });
  } catch (err) {
    console.error("Error fetching payment applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------- Review Routes ----------------- //

// create reviews

app.post("/api/create-reviews", async (req, res) => {
  try {
    const result = await reviewCollection.insertOne(req.body);
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get all reviews

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await reviewCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//----------------- Payment Routes ----------------- //

// stripe payment creation

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 1️⃣ Create PaymentIntent
app.post("/api/create-payment", async (req, res) => {
  // console.log(req.body);
  const { policyId, policyName, amount, customerEmail } = req.body;

  if (!policyId || !policyName || !amount || !customerEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: "usd",
      receipt_email: customerEmail,
      metadata: { policyId, policyName },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Save transaction after success and update status and new date in applicationCollection
app.post("/api/save-transaction", async (req, res) => {
  const { paymentIntentId, email, policyId, applicationId } = req.body;

  if (!paymentIntentId || !email || !policyId || !applicationId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const amount = paymentIntent.amount / 100; // poisha → taka
    const status = paymentIntent.status;
    const date = new Date();

    // ✅ Find application by applicationId
    const application = await applicationCollection.findOne({
      _id: new ObjectId(applicationId),
      email,
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const policyName =
      application.policyDetails?.title || paymentIntent.metadata.policyName;

    // calculate next due date based on frequency
    const frequency = application.payment?.frequency || "monthly";
    let nextPayment = new Date();
    if (frequency === "monthly")
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    else if (frequency === "yearly")
      nextPayment.setFullYear(nextPayment.getFullYear() + 1);

    // ✅ Update application record
    await applicationCollection.updateOne(
      { _id: new ObjectId(applicationId), email },
      {
        $set: {
          status: "Approved",
          "payment.status": "Paid",
          "payment.lastPaymentDate": date,
          "payment.nextPaymentDue": nextPayment,
          "payment.paymentIntentId": paymentIntentId,
        },
      }
    );

    // save transaction log
    const transaction = {
      transactionId: paymentIntentId,
      applicationId, // ✅ link transaction to application
      policyId, // keep for reference
      customerEmail: email,
      policyName,
      paidAmount: amount,
      date,
      status,
    };

    await transactionsCollection.insertOne(transaction);

    res.json({
      success: true,
      message: "Transaction saved successfully",
      data: { ...transaction, nextPaymentDue: nextPayment },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// get all transactions
app.get("/api/get-transactions", async (req, res) => {
  try {
    const transactions = await transactionsCollection.find().toArray();
    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//-----------------------Claim request routes------------------//

// get all claims
app.get("/api/claims", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const claims = await claimCollection
      .find({ customerEmail: email })
      .toArray();
    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//create new claim

app.post("/api/claim-request", async (req, res) => {
  try {
    console;
    const { policy_id, customerEmail, reason, document } = req.body;

    if (!policy_id || !customerEmail || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if claim already exists
    const existingClaim = await claimCollection.findOne({
      policy_id,
      customerEmail,
    });
    if (existingClaim) {
      return res
        .status(400)
        .json({ success: false, message: "Claim already submitted" });
    }

    const result = await claimCollection.insertOne({
      policy_id,
      customerEmail,
      reason,
      document,
      status: "Pending",
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Claim submitted successfully",
        data: result,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get all claims

app.get("/api/get-all-claims", async (req, res) => {
  try {
    const claims = await claimCollection.find().toArray();
    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// approve or reject claim

app.patch("/api/claim-approve/:claimId", async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, agentEmail } = req.body; 

    // Find the claim
    const claim = await claimCollection.findOne({ _id: new ObjectId(claimId) });
    if (!claim)
      return res.status(404).json({ success: false, message: "Claim not found" });

    await claimCollection.updateOne(
      { _id: new ObjectId(claimId) },
      { 
        $set: { 
          status, 
          approvedAt: status === "Approved" ? new Date() : null, 
          agentEmail 
        } 
      }
    );


    if (status === "Approved") {
      await policyCollection.updateOne(
        { _id: new ObjectId(claim.policyId) },
        { $inc: { purchaseCount: 1 } }
      );
    }

    res.status(200).json({ success: true, message: `Claim ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// get claim by policy ID
app.get("/api/claim-by-policy/:policy_id", async (req, res) => {
  try {
    const { policy_id } = req.params;

    if (!policy_id) {
      return res
        .status(400)
        .json({ success: false, message: "Policy ID is required" });
    }

    const claim = await claimCollection.findOne({ policy_id });

    if (!claim) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------------- dashboard stats Routes ---------------- //


// Get dashboard stats for a specific agent
app.get("/api/agent/:email/stats", async (req, res) => {
  try {
    const agentEmail = req.params.email;

    // Blogs written by this agent
    const blogsCount = await blogCollection.countDocuments({ authorEmail: agentEmail });

    // Customers assigned to this agent
    const customersCount = await applicationCollection.countDocuments({ agent: agentEmail });

    // Policies cleared by this agent
    const policiesClearedCount = await claimCollection.countDocuments({
      agentEmail: agentEmail,
      status: "Approved"  // assuming "Approved" means cleared
    });

    res.status(200).json({
      success: true,
      data: {
        blogs: blogsCount,
        customers: customersCount,
        policyCleared: policiesClearedCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.get("/api/agent/:email/recent-activity", async (req, res) => {
  try {
    const agentEmail = req.params.email;
    const limit = parseInt(req.query.limit) || 5;

    // Fetch recent blogs
    const blogs = await blogCollection
      .find({ authorEmail: agentEmail })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Fetch recent assigned customers
    const customers = await applicationCollection
      .find({ agent: agentEmail })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Fetch recent cleared policies
    const policies = await claimCollection
      .find({ agentEmail: agentEmail, status: "Approved" })
      .sort({ approvedAt: -1 })
      .limit(limit)
      .toArray();

    const activities = [
      ...blogs.map(b => ({ type: "Blog Posted", name: b.title, date: b.date })),
      ...customers.map(c => ({ type: "Customer Assigned", name: c.name, date: c.createdAt })),
      ...policies.map(p => ({ type: "Policy Cleared", name: p.policy_id, date: p.approvedAt })),
    ];

    // Sort all activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ success: true, data: activities.slice(0, limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.get("/api/agent/:email/monthly-activity", async (req, res) => {
  try {
    const agentEmail = req.params.email;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const getMonthlyCount = async (collection, matchField, statusFilter) => {
      const match = { [matchField]: agentEmail };
      if (statusFilter) match.status = statusFilter;

      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
      ];
      return collection.aggregate(pipeline).toArray();
    };

    const blogs = await getMonthlyCount(blogCollection, "authorEmail");
    const customers = await getMonthlyCount(applicationCollection, "agent");
    const policies = await getMonthlyCount(claimCollection, "agentEmail", "Approved");

    const data = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        blogs: blogs.find(b => b._id === month)?.count || 0,
        customers: customers.find(c => c._id === month)?.count || 0,
        policies: policies.find(p => p._id === month)?.count || 0,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
