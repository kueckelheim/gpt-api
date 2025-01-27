import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
import express from "express";
import { engine } from "express-handlebars";
import { setRoutes } from "./routes/index";
import { marked } from "marked";

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Handlebars as the view engine
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "layout", // Set the default layout to 'layout.hbs'
    layoutsDir: "./src/views", // Specify the layouts directory
    helpers: {
      json: (context: any) => JSON.stringify(context),
      markdown: (text: string) => marked(text),
    },
  })
);
app.set("view engine", "hbs");
app.set("views", "./src/views");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public")); // Serve static files from the 'public' directory

// Set up routes
setRoutes(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
