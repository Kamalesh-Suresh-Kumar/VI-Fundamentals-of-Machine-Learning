# Loan Harmony Nexus

Loan Harmony Nexus is a comprehensive AI-powered lending platform. It combines a robust MERN stack architecture with a dedicated Python FastAPI service that leverages Machine Learning to evaluate loan risk, helping lenders make highly informed approval decisions while providing borrowers with a streamlined, seamless loan application experience.

## System Architecture

The project is structured into three main microservices/modules functioning harmoniously:

1. **Frontend (`/frontend`)** - *React + Vite + TypeScript*
2. **Backend (`/backend`)** - *Node.js + Express + MongoDB*
3. **ML Risk Engine (`/ml-model`)** - *Python + FastAPI + Scikit-Learn*

---

> For tutorial refer [Tutorial Video](./Demo.mp4)

---

### 1. Frontend Client
A modern, highly-responsive administrative dashboard and client portal built for premium aesthetics and functionality.

**Key Technologies:**
- **Core Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (v3/v4), standard CSS Variables
- **UI Components**: Shadcn UI, Radix UI primitives 
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form, Zod constraints
- **Routing**: React Router DOM (v6)
- **Data visualization**: Recharts, Embla Carousel

**Features:**
- **Role-based Dashboards**: Separate seamless UI flows for Borrowers, Lenders, and Admins.
- **Dynamic Forms**: Comprehensive Loan Application gathering deep financial and employment history.
- **Smart Analytics**: Real-time evaluation visualizations showing probability metrics from multiple ML models for Lenders.
- **Offline Context caching**: Leverages LocalStorage logic through robust Context providers (`LoanContext`, `AuthContext`) acting as secondary caching mechanisms.

### 2. Node.js REST API
The core system controller routing logic, authentication, and persisting loan configurations.

**Key Technologies:**
- **Core Environment**: Node.js, Express.js
- **Database**: MongoDB via Mongoose ORM
- **Security & Middlewares**: bcryptjs, CORS, dotenv

**Features:**
- **Loan Schema mapping**: Extensive Mongoose mapping covering every property detailed by both parties (duration, interest rate, paid months tracker, DTI strings, etc).
- **Payment tracking**: Dedicated updating endpoints to track months-paid progressions.
- **Real-time Sync**: Pushes approved datasets natively.

### 3. Machine Learning Risk Engine
A dedicated microservice strictly built to evaluate application reliability using varied ensemble models.

**Key Technologies:**
- **Web App API**: FastAPI, Uvicorn
- **Data Processing**: Pandas, NumPy
- **Machine Learning Models**: Scikit-Learn, XGBoost, CatBoost
- **Persistence**: Joblib (for model loading)

**Features:**
- **Ensemble Methodologies**: Compares CatBoost (Primary Decision engine), XGBoost, Random Forest, and standard Logistic Regression to form a consolidated approval probability matrix.
- **Behavioral Scoring**: Uses qualitative metrics like "Utility Bill Payments", "Gig Economy Income", and quantitative metrics like "Debt-to-Income" to forge predictive outcomes.

---

## Setup & Run Instructions

> Select the location and run the following commands

### 0. Setup
```bash
git clone https://github.com/Kamalesh-Suresh-Kumar/VI-Fundamentals-of-Machine-Learning.git
cd "084-138 - KamaleshSP-ElumalaiB - FOML LAB\loan-harmony-nexus"
```

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
The Frontend runs natively via Vite.

### 2. Backend
Ensure you have a MongoDB instance running locally or via Atlas.

**Environment Variables Setup:**
Before running the backend, create a `.env` file inside the `backend/` folder:
```bash
# backend/.env

MONGO_URI=your_mongodb_connection_string
PORT=5000
SECRET_KEY=your_secret_key_for_jwt
```

| Key | Description |
|---|---|
| `MONGO_URI` | Your MongoDB connection string. Use `mongodb://localhost:27017/loanharmonydb` for local, or get one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| `PORT` | Port for the main backend server (default: `5000`) |
| `SECRET_KEY` | A long random string used to sign JWT tokens. Copy the output of below command and paste it as the value for `SECRET_KEY` in your `.env` file. |

**Generating `SECRET_KEY`:**
A key generator script is already included in the project. Run this from inside the `backend/` folder:
```bash
cd backend
node key.js
```

> Never commit your `.env` file to GitHub. It is already listed in `.gitignore`.

**Step 1 — Install & start the main backend** (Port 5000):
```bash
cd backend
npm install
npm run dev
```
The backend initializes under `nodemon`.

**Step 2 — Install & start the OTP server** (Port 5001, open a new terminal):
```bash
cd backend/server
npm install
node index.js
```
> The `backend/server/` folder is a separate mini-server for OTP email handling. It has its **own** `package.json` and must be installed and started independently.

### 3. ML Model Service
Ensure you have Python 3.9+ installed natively.
```bash
cd ml-model
pip install -r requirements.txt
uvicorn app:app --reload
```
> Note: Ensure the entry file maps to your python script (typically app.py)

## Features Roadmap
- [x] Integrate Mongoose ORM completely for the Loan Database.
- [x] Auto-Fetch dynamic features calculating `Existing Loan Accounts` natively off users.
- [x] ML Display box layout bugfixes and dynamic DTI evaluation integrations.
- [x] Live Syncing of Monthly Repayment milestones.

## Authors
- Elumalai B
- Kamalesh S P
