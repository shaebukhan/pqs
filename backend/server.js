const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const path = require("path");
//auth routes
const authRoutes = require("./routes/authRoute");
const bankRoutes = require("./routes/bankRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const walletRoutes = require("./routes/walletRoutes");
const kycRoutes = require("./routes/kycRoute");
const withdrawRoutes = require("./routes/withdrawRoutes");
const adminRoutes = require("./routes/adminRoute");

const cors = require("cors");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Config
dotenv.config();
// Database config
connectDB();
// Middlewares

const corsOptions = {
  origin: "https://pqs.fund", // Allow only requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow only these methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow only these headers
};

// Use CORS middleware with specified options
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bank", bankRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/withdraw", withdrawRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/", (req, res) => {
  res.send("testing");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
