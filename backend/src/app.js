const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const authRouter = require('./modules/auth/auth.route');
const builderRouter = require('./modules/builder/builder.router');
const societyRouter = require('./modules/society/society.router');
const flatRouter = require('./modules/flat/flat.router');
const readingRouter = require('./modules/reading/reading.router');
const billingRouter = require('./modules/billing/billing.router');
const dashboardRouter = require('./modules/dashboard/dashboard.router');


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/builder', builderRouter);
app.use('/api/society', societyRouter);
app.use('/api/flat', flatRouter);
app.use('/api/reading', readingRouter);
app.use('/api/billing', billingRouter);
app.use('/api/dashboard', dashboardRouter);

console.log({
  authRouter,
  builderRouter,
  societyRouter,
  flatRouter,
  readingRouter,
  billingRouter,
  dashboardRouter
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "API is working properly"
    })
});

app.get("/", (req, res) => {
    res.send("API is working properly");
});

module.exports = app;