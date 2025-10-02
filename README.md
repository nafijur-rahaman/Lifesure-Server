# ⚙️ Life Insurance Management Platform (Backend)

This is the **backend REST API** for the Life Insurance Management Platform. Built with **Node.js, Express, and MongoDB**, it provides secure endpoints for authentication, policies, applications, payments, claims, blogs, and user management.  

## 🌐 Live API
[🔗 Backend API URL](https://tripora-server.vercel.app/)

---

## ✨ Features

- 🔐 **Authentication & Authorization**: Firebase Auth + JWT-based role access (Admin, Agent, Customer).  
- 👥 **User Management**: Promote/demote users, assign roles, and secure access.  
- 📑 **Policy Management**: CRUD operations for policies (add, edit, delete, fetch).  
- 📃 **Applications**: Store and update customer applications with statuses (Pending, Approved, Rejected).  
- 🧾 **Claims**: Customers can request claims; agents/admins can approve/reject.  
- 💳 **Stripe Payment Integration**: Secure premium payments with transaction logging.  
- 📰 **Blogs API**: CRUD for blogs with visit count tracking.  
- ⭐ **Customer Reviews**: Manage dynamic reviews for testimonials.  
- 📄 **PDF Generation API**: Generate downloadable approved policy documents.  
- 🚫 **Error Handling**: Handles 401 Unauthorized & 403 Forbidden role mismatches.  

---

## 🛠 Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB
- **Auth:** Firebase, JWT  
- **Payments:** Stripe  
- **Utilities:** CORS, dotenv, bcrypt, cookie-parser  

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed  
- MongoDB connection string (Atlas or local)  
- Firebase project credentials  

### Installation

```bash
# Clone the repo
git clone https://github.com/nafijur-rahaman/Lifesure-Server

# Navigate to project folder
cd life-insurance-server

# Install dependencies
npm install

# Create .env file in root with the following keys:
PORT=3000
DB_PASS=**********
DB_NAME=lifesure
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh
STRIPE_SECRET_KEY=your_stripe_secret

# Start the server
nodemon index.js

```
## Api Enpoints
### 🔐 Auth Routes

#### Public Routes
| Method | Endpoint      | Description                     | Parameters |
|--------|--------------|---------------------------------|------------|
| POST   | `/api/login` | Login user and generate access + refresh tokens | `email` **string** - **Required** |
| POST   | `/api/refresh` | Generate new access token using refresh token | `refreshToken` **string** - **Required** |

## 👤 User Routes

### Public Routes
| Method | Endpoint         | Description                          | Parameters |
|--------|------------------|--------------------------------------|------------|
| POST   | `/api/users`     | Create user if not exists, else return existing | Request body (JSON) → `{ email, name, role?, ... }` |
| GET    | `/api/user-info` | Get user info by email               | `email` **string** – **Required** (query param) |
| GET    | `/api/get-agent-users` | Get all users with role = agent | N/A |

### Protected Routes (require JWT)
| Method | Endpoint               | Description                     | Parameters |
|--------|------------------------|---------------------------------|------------|
| GET    | `/api/get-users`       | Get all users (**admin/agent only**) | N/A |
| PUT    | `/api/update-user-role/:id` | Update user role by ID (**admin only**) | `id` **string** – **Required** (User ID)<br>Request body: `{ "role": "admin/agent/user" }` |
| DELETE | `/api/delete-user/:id` | Delete a user by ID (**admin only**) | `id` **string** – **Required** (User ID) |

---

## 📜 Policy Routes

### Public Routes
| Method | Endpoint              | Description                       | Parameters |
|--------|-----------------------|-----------------------------------|------------|
| GET    | `/api/get-policies`   | Get all policies with pagination & search | `search` **string** *(optional)* – search by title<br>`page` **number** *(optional, default=1)*<br>`limit` **number** *(optional, default=9)* |
| GET    | `/api/get-top-policies` | Get top 3 most purchased policies | N/A |

### Protected Routes (require JWT)
| Method | Endpoint              | Description                       | Parameters |
|--------|-----------------------|-----------------------------------|------------|
| POST   | `/api/create-polices` | Create a new policy | Request body (JSON) – policy details |
| PUT    | `/api/update-policy/:id` | Update a policy by ID (**admin only**) | `id` **string** – **Required** (Policy ID) |
| GET    | `/api/get-policy/:id` | Get a single policy by ID | `id` **string** – **Required** (Policy ID) |
| DELETE | `/api/delete-policy/:id` | Delete a policy by ID | `id` **string** – **Required** (Policy ID) |

---

## 📝 Blog Routes

### Public Routes
| Method | Endpoint              | Description                             | Parameters |
|--------|-----------------------|-----------------------------------------|------------|
| GET    | `/api/get-blogs`      | Get all blogs with pagination & category filter | `page` **number** *(optional, default=1)*<br>`limit` **number** *(optional, default=9)*<br>`category` **string** *(optional, default=all)* |
| POST   | `/api/increment-visit/:id` | Increment visit count of a blog by ID | `id` **string** – **Required** (Blog ID) |

### Protected Routes (require JWT)
| Method | Endpoint                | Description                          | Parameters |
|--------|-------------------------|--------------------------------------|------------|
| GET    | `/api/get-blogs-user`   | Get blogs created by a specific user | `userId` **string** – *(query param, optional)* |
| GET    | `/api/get-blog/:id`     | Get a single blog by ID              | `id` **string** – **Required** (Blog ID) |
| POST   | `/api/create-blog`      | Create a new blog (**admin/agent only**) | Request body (JSON) – blog fields |
| PUT    | `/api/update-blog/:id`  | Update a blog by ID (**admin/agent only**) | `id` **string** – **Required** (Blog ID) |
| DELETE | `/api/delete-blog/:id`  | Delete a blog by ID (**admin/agent only**) | `id` **string** – **Required** (Blog ID) |

---

## 📄 Application Routes

### Protected Routes (require JWT)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET    | `/api/applications` | Get all submitted applications (**admin/agent only**) | N/A |
| PATCH  | `/api/application/:id/assign-agent` | Assign agent to an application (**admin only**) | `id` **string** – **Required** (Application ID)<br>Request body: `{ "agent": "agentEmail" }` |
| POST   | `/api/submit-application` | Submit a new application (**customer only**) | Request body (JSON): `{ name, email, phone, policy_id, ... }` *(name, email, phone, policy_id are required)* |
| GET    | `/api/agent/:agentEmail/applications` | Get all applications for a specific agent (**admin/agent only**) | `agentEmail` **string** – **Required** (URL param) |
| PATCH  | `/api/agent/application/:id/status` | Update application status (Pending → Approved/Rejected) and increment purchase count if approved (**admin/agent only**) | `id` **string** – **Required**<br>Request body: `{ "status": "Approved/Rejected", "feedback": "optional" }` |
| GET    | `/api/get-application/:id` | Get specific application by ID | `id` **string** – **Required** (Application ID) |
| GET    | `/api/applied-policies` | Get all applied policies by customer email | `email` **string** – **Required** (query param) |
| GET    | `/api/customer/payments` | Get all approved policies with payment info for a customer | `email` **string** – **Required** (query param) |

---

## Review API Endpoints

### Protected Routes (require Firebase token in Authorization header)

| Method | Endpoint           | Description              | Parameters |
|--------|-------------------|--------------------------|-------------|
| POST   | `/api/create-reviews` | Create a new review (customer only) | Request Body: `{ rating, comment, customerId, packageId, ... }` |

---

### Public Routes

| Method | Endpoint  | Description            | Parameters |
|--------|-----------|------------------------|-------------|
| GET    | `/api/reviews` | Fetch all reviews (latest first) | N/A |


## Payment API Endpoints

### Protected Routes (require Firebase token in Authorization header)

| Method | Endpoint             | Description                              | Parameters |
|--------|----------------------|------------------------------------------|-------------|
| POST   | `/api/create-payment` | Create a Stripe payment intent (customer only) | Request Body: `{ policyId, policyName, amount, customerEmail }` |
| POST   | `/api/save-transaction` | Save transaction after successful payment and update application status | Request Body: `{ paymentIntentId, email, policyId, applicationId }` |
| GET    | `/api/get-transactions` | Fetch all transactions (admin only) | N/A |


## Claim API Endpoints

### Protected Routes (require Firebase token in Authorization header)

| Method | Endpoint                   | Description                          | Parameters |
|--------|-----------------------------|--------------------------------------|-------------|
| GET    | `/api/claims?email=:email`  | Get all claims for a customer by email (agent & customer access) | Query: `email` **string** - **Required** |
| POST   | `/api/claim-request`        | Create a new claim (customer only) | Request Body: `{ policy_id, customerEmail, reason, document }` |
| GET    | `/api/get-all-claims`       | Get all claims (agent & customer access) | N/A |
| PATCH  | `/api/claim-approve/:claimId` | Approve or reject a claim (agent only) | Params: `claimId` **string** - **Required**. Request Body: `{ status, agentEmail }` |
| GET    | `/api/claim-by-policy/:policy_id` | Get claim by policy ID (customer & agent access) | Params: `policy_id` **string** - **Required** |

## Agent Dashboard API Endpoints

### Protected Routes (require Firebase token in Authorization header)

| Method | Endpoint                                | Description                                  | Parameters |
|--------|------------------------------------------|----------------------------------------------|-------------|
| GET    | `/api/agent/:email/stats`               | Get dashboard stats for a specific agent (blogs, customers, policies cleared) | Params: `email` **string** – agent’s email |
| GET    | `/api/agent/:email/recent-activity`     | Get recent activity (blogs posted, customers assigned, policies cleared) for a specific agent | Params: `email` **string** – agent’s email. Query: `limit` **number** *(optional, default=5)* |
| GET    | `/api/agent/:email/monthly-activity`    | Get monthly activity counts for blogs, customers, and cleared policies (grouped by month) | Params: `email` **string** – agent’s email. Query: `year` **number** *(optional, default=current year)* |

## Client Dashboard API Endpoints

### Protected Routes (require Firebase token in Authorization header)

| Method | Endpoint                             | Description                                         | Parameters |
|--------|--------------------------------------|-----------------------------------------------------|------------|
| GET    | `/api/client/:email/stats`           | Get dashboard stats for a customer (total policies, pending/approved claims, total paid) | Params: `email` **string** – customer’s email |
| GET    | `/api/client/:email/monthly-payments` | Get monthly payments summary for a customer        | Params: `email` **string** – customer’s email |

## Admin Dashboard API Endpoints

### Protected Routes (require Firebase token in Authorization header)

| Method | Endpoint                          | Description                                         | Parameters |
|--------|-----------------------------------|-----------------------------------------------------|------------|
| GET    | `/api/admin/stats`                | Get overall admin dashboard stats (total users, total policies, total applications, total payments) | N/A |
| GET    | `/api/admin/monthly-payments`     | Get aggregated monthly payments for all customers  | N/A |
| GET    | `/api/admin/policy-distribution` | Get policy distribution grouped by category        | N/A |


## 📧 Contact

**Author:** Md. Nafijur Rahaman  

**GitHub:** [nafijur-rahaman](https://github.com/nafijur-rahaman)  

**Email:** [tanjidnafis@gmail.com](mailto:tanjidnafis@gmail.com)







