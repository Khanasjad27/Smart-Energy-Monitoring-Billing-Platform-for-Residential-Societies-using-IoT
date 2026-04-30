const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const authRouter = require('./modules/auth/auth.route');
const builderRouter = require('./modules/builder/builder.router');
const societyRouter = require('./modules/society/society.router');


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

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "API is working properly"
    })
});

app.get("/", (req, res) => {
    res.send("API is working properly");
});

module.exports = app;