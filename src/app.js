import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Security best practice (need to fix the limit for the body-payload; form-data or json).
app.use(
  express.json({
    limit: "16kb", // size limit
  })
);

// URL handling
app.use(
  express.urlencoded({
    extended: true, // able to encode nested object to url.
    limit: "16kb", // size limit
  })
);

// Static directory
app.use(express.static("public"));
app.use(cookieParser());

export { app };
