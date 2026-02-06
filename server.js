require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const port = process.env.PORT || 8000;

// Database Connection
const connectDB = require("./utils/db");
const templateRoute = require("./router/template-router");

const statusMointor = require("express-status-monitor");

// Routes
const authRoute = require("./router/auth-router");
const languageRoute = require("./router/language-router");
const triviaTypesRoute = require("./router/triviatypes-router");
const socialLinkRoute = require("./router/sociallink-router");
const sectiontemplateRoute = require("./router/sectiontemplate-router");
const genreMasterRoute = require("./router/genremaster-router");
const roleRoute = require("./router/role-router");
// const referenceRoute = require("./router/references-router")

const movievRoute = require("./router/moviev-router");
const seriesRoute = require("./router/series-router");
const electionRoute = require("./router/election-router");
const positionsRoute = require("./router/positions-router");
const userManagementRoute = require("./router/usermanagement-router");

const celebrityRoute = require("./router/celebrity-router");
const timelineRoute = require("./router/timeline-router");
const sectionmasterRoute = require("./router/sectionmaster-router");

const triviaentriesRoute = require("./router/triviaentries-router");

const profileRoute = require("./router/profile-router");
const professionalmasterRoute = require("./router/professionalmaster-router");

const testimonialsRoute = require("./router/testimonials-router");
const dashboardRoute = require("./router/dashboard-router");

const privilegesRoutes = require("./router/privilege-router");

const globalErrorHandler  = require("./middlewares/error.middleware");
const trackActivity = require("./middlewares/trackActivity");
const ckeditorRoute = require("./router/ckeditor-router");

console.log( process.env.FRONTEND_URL)
const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/professions', express.static(path.join(__dirname, 'public/professions')));

app.use('/template',express.static(path.join(__dirname , 'public/template')))


app.use('/celebrity', express.static(path.join(__dirname, 'public/celebrity')));
app.use('/timeline', express.static(path.join(__dirname, 'public/timeline')));
app.use('/triviaentries', express.static(path.join(__dirname, 'public/triviaentries')));
app.use('/moviev', express.static(path.join(__dirname, 'public/moviev')));
app.use('/series', express.static(path.join(__dirname, 'public/series')));
app.use('/election', express.static(path.join(__dirname, 'public/election')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/custom-section", express.static(path.join(__dirname, "public/custom-section")));

app.use('/positions', express.static(path.join(__dirname, 'public/positions')));
app.use('/sectionmaster', express.static(path.join(__dirname, 'public/sectionmaster')));

app.use('/profile', express.static(path.join(__dirname, 'public/profile')));
app.use('/testimonial', express.static(path.join(__dirname, 'public/testimonial')));


const safeTrackActivity = (req, res, next) => {
  if (req.method === "OPTIONS") return next(); // Skip preflight
  trackActivity(req, res, next);
};

app.use("/api/auth", safeTrackActivity, authRoute);
app.use("/api/professionalmaster", professionalmasterRoute);
app.use("/api/template", templateRoute);
app.use("/api/language", safeTrackActivity, languageRoute);
app.use("/api/triviaTypes", triviaTypesRoute);
app.use("/api/celebraty", celebrityRoute);
app.use("/api/timeline", timelineRoute);
app.use("/api/triviaentries", triviaentriesRoute);
app.use("/api/moviev", movievRoute);
app.use("/api/series", seriesRoute);
app.use("/api/election", electionRoute);
app.use("/api/positions", positionsRoute);
app.use("/api/sectionmaster", sectionmasterRoute);
app.use("/api/sectiontemplate", sectiontemplateRoute);
app.use("/api/privileges", privilegesRoutes);
app.use("/api/socialLink", socialLinkRoute);
app.use("/api/genreMaster", genreMasterRoute);
app.use("/api/roles", roleRoute);
app.use("/api/profile", profileRoute);
app.use("/api/testimonial", testimonialsRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/users", userManagementRoute);
app.use("/api/ckeditor", ckeditorRoute);

app.use('/api/references', require('./router/references-router'));
app.use('/api/related-personalities', require('./router/relatedpersonality-routes'));

app.use('/api/custom-sections' , require('./router/customoption-router'))
app.use('/api/options', require('./router/options-router'));


app.use("/api/celebrity-sections", require("./router/celebratysection-router"));

// app.use("/api/references", referenceRoute); 



app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.get("/health/details", async (req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      status: "DOWN",
      error: err.message,
    });
  }
});


app.use(globalErrorHandler);


connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
});
