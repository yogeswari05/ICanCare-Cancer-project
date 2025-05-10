const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger/swagger.js");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const mongoURI = process.env.MONGO_URI;
const cookieParser = require("cookie-parser");

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(cors({
  origin: ['http://localhost:80', 'http://localhost:3000', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Disposition']
}));

app.use(express.static('public'));

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/doctor", require("./routes/doctor.routes"));
app.use("/api/patient", require("./routes/patient.routes"));
app.use("/api/case", require("./routes/case.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/documents", require("./routes/document.routes"));
app.use("/api/meetings", require("./routes/meeting.routes"));
app.use("/api/forum", require("./routes/forum.routes"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('ICanCare API Server Running');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
