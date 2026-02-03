const express = require("express");
const router = express.Router();
const Election = require("../controllers/election-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");
const validate = require("../middlewares/validate.middleware");
router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/election";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes

router.get("/languageOptions", Election.languageOptions);

const { z } = require("zod");

// Define reference item schema
const referenceItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Invalid URL format"),
});

const addElectionSchema = z.object({
  election_year: z
    .number({ invalid_type_error: "Election year must be a number" })
    .int()
    .min(1900, "Year must be valid")
    .max(2100, "Year must be valid"),
  
  type: z.enum(["Lok Sabha", "Vidhan Sabha", "Rajya Sabha", "Municipal"], {
    errorMap: () => ({ message: "Type must be a valid election type" }),
  }),
  
  state: z.string().min(2, "State is required"),
  constituency: z.string().optional(),
  party: z.string().optional(),
  role: z.string().optional(),
  
  result: z.enum(["Won", "Lost", "Withdrawn", "Pending"]).optional(),
  
  vote_share: z
    .number()
    .min(0, "Vote share cannot be negative")
    .max(100, "Vote share cannot exceed 100")
    .optional(),
  
  votes: z.number().int().optional(),
  opponent: z.string().optional(),
  notes: z.string().optional(),
  
  reference: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch (err) {
        throw new Error("Invalid JSON for reference");
      }
    })
    .refine((arr) => Array.isArray(arr), { message: "Reference must be an array" })
    .transform((arr) =>
      arr.map((item) => referenceItemSchema.parse(item))
    ),
  
  celebrityId: z.string().min(1, "Celebrity ID is required"),
  createdBy: z.string().optional(),
  sort: z.number().int().optional(),
  statusnew: z.string().optional(),
});


router.post(
  "/addElection",
  validate(addElectionSchema),
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  
  Election.addElection
);
router.get("/getElectionByCelebrity/:celebrityId", Election.getElectionByCelebrity);

router.patch("/update-statusElection", Election.updateStatus);
router.delete("/deleteelection/:id", Election.deleteelection);
router.get("/getelectionByid/:id", Election.getelectionByid);
router.patch(
  "/updateelection/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  Election.updateElection
);

module.exports = router;
