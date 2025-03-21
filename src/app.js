const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173', // Updated to match your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true // Added to support credentials if needed
};

app.use(cors(corsOptions));

mongoose
  .connect("mongodb://127.0.0.1:27017/Quiz-AI")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Answer schema - common for all submissions
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
});

// Base submission schema
const submissionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    required: true
  },
  maxPossibleScore: {
    type: Number,
    default: 125 // Assuming 25 questions with max 5 points each
  },
  percentageScore: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Create 8 different submission models (A through H)
const SubmissionA = mongoose.model('SubmissionA', submissionSchema);
const SubmissionB = mongoose.model('SubmissionB', submissionSchema);
const SubmissionC = mongoose.model('SubmissionC', submissionSchema);
const SubmissionD = mongoose.model('SubmissionD', submissionSchema);
const SubmissionE = mongoose.model('SubmissionE', submissionSchema);
const SubmissionF = mongoose.model('SubmissionF', submissionSchema);
const SubmissionG = mongoose.model('SubmissionG', submissionSchema);
const SubmissionH = mongoose.model('SubmissionH', submissionSchema);

// User details schema
const userDetailsSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, format: "email" },
  phone: { type: String, match: /^[0-9]{10}$/ },
  age: { 
    type: String, 
    required: true,
    enum: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65 or older", "Prefer not to say"]
  },
  gender: { 
    type: String, 
    required: true,
    enum: ["Male", "Female", "Non-binary", "Prefer to self-describe", "Prefer not to say"]
  },
  genderDescription: { type: String },
  education: { 
    type: String, 
    required: true,
    enum: [
      "Less than high school",
      "High school diploma or equivalent",
      "Some college, no degree",
      "Associate's degree",
      "Bachelor's degree",
      "Master's degree",
      "Doctoral degree or higher",
      "Prefer not to say"
    ]
  },
  occupation: { type: String },
  aiExperience: { 
    type: String,
    required: true,
    enum: ["Yes", "No", "Unsure"]
  },
  aiTools: { 
    type: [String],
    enum: ["chatbots", "recommendation", "professionalAI", "creativeAI", "otherAI"]
  },
  otherAIText: { type: String },
  location: { type: String, required: true },
  language: { type: String, required: true },
  accessibility: { 
    type: String,
    enum: ["Yes", "No", "Prefer not to say"]
  },
  assistiveTechnology: { type: String },
  additionalComments: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

// User details routes
app.post("/api/user-details", async (req, res) => {
  try {
    const userDetailsData = req.body;
    const userDetails = new UserDetails(userDetailsData);
    await userDetails.save();
    res.status(201).json({ message: "User details saved successfully", userDetails });
  } catch (error) {
    console.error("Error saving user details:", error);
    res.status(500).json({ error: "Failed to save user details", details: error.message });
  }
});

// Get user details by email (more practical than by ID)
app.get("/api/user-details/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch user details by email
    const userDetails = await UserDetails.findOne({ email: email });

    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ error: "Failed to retrieve user details" });
  }
});


// Keep the original ID-based route for backward compatibility
app.get("/api/user-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userDetails = await UserDetails.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ error: "Failed to retrieve user details" });
  }
});

// Helper function to create submission routes for each quiz
function createSubmissionRoutes(quizLetter, SubmissionModel) {
  // POST route for creating a submission
  app.post(`/api/submissions${quizLetter}`, async (req, res) => {
    try {
      const submissionData = req.body;
      
      // Validate required fields
      if (!submissionData.userEmail) {
        return res.status(400).json({ error: "User email is required" });
      }
      
      if (!submissionData.answers || !Array.isArray(submissionData.answers) || submissionData.answers.length === 0) {
        return res.status(400).json({ error: "Answers are required and must be an array" });
      }
      
      const submission = new SubmissionModel(submissionData);
      await submission.save();
      res.status(201).json({ 
        message: `Submission ${quizLetter} created successfully`, 
        submission 
      });
    } catch (error) {
      console.error(`Error creating submission ${quizLetter}:`, error);
      res.status(500).json({ 
        error: `Failed to create submission ${quizLetter}`, 
        details: error.message 
      });
    }
  });

  // GET route for retrieving a user's submissions by email
  app.get(`/api/submissions${quizLetter}/user/email/:email`, async (req, res) => {
    try {
      const { email } = req.params;
      const submissions = await SubmissionModel.find({ userEmail: email })
        .sort({ submittedAt: -1 });
  
      // Calculate additional statistics if needed
      const processedSubmissions = submissions.map(submission => ({
        ...submission.toObject(),
        totalQuestions: submission.answers.length,
        correctAnswers: submission.answers.filter(answer => answer.score > 0).length
      }));
  
      res.status(200).json(processedSubmissions);
    } catch (error) {
      console.error(`Error retrieving submissions ${quizLetter}:`, error);
      res.status(500).json({ error: `Failed to retrieve submissions ${quizLetter}` });
    }
  });
  

  // Keep the original userId-based route for backward compatibility
  app.get(`/api/submissions${quizLetter}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const submissions = await SubmissionModel.find({ userId })
        .sort({ submittedAt: -1 });
      res.status(200).json(submissions);
    } catch (error) {
      console.error(`Error retrieving submissions ${quizLetter}:`, error);
      res.status(500).json({ error: `Failed to retrieve submissions ${quizLetter}` });
    }
  });

  // GET route for retrieving a specific submission
  app.get(`/api/submissions${quizLetter}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await SubmissionModel.findById(id);
      if (!submission) {
        return res.status(404).json({ error: `Submission ${quizLetter} not found` });
      }
      res.status(200).json(submission);
    } catch (error) {
      console.error(`Error retrieving submission ${quizLetter}:`, error);
      res.status(500).json({ error: `Failed to retrieve submission ${quizLetter}` });
    }
  });

  // GET route for retrieving all submissions with pagination
  app.get(`/api/submissions${quizLetter}`, async (req, res) => {
    try {
      const { limit = 10, skip = 0, email } = req.query;
      
      // Build query object
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      
      const submissions = await SubmissionModel.find(query)
        .sort({ submittedAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
        
      // Get total count for pagination
      const total = await SubmissionModel.countDocuments(query);
      
      res.status(200).json({
        submissions,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      });
    } catch (error) {
      console.error(`Error retrieving submissions ${quizLetter}:`, error);
      res.status(500).json({ error: `Failed to retrieve submissions ${quizLetter}` });
    }
  });
}

// Create routes for each submission type
createSubmissionRoutes('A', SubmissionA);
createSubmissionRoutes('B', SubmissionB);
createSubmissionRoutes('C', SubmissionC);
createSubmissionRoutes('D', SubmissionD);
createSubmissionRoutes('E', SubmissionE);
createSubmissionRoutes('F', SubmissionF);
createSubmissionRoutes('G', SubmissionG);
createSubmissionRoutes('H', SubmissionH);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message 
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
