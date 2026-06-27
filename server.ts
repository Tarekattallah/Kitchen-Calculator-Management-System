import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initialCatalogData } from "./src/data/initialCatalog";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing json and urlencoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path for storing custom catalog
const CATALOG_FILE_PATH = path.join(__dirname, "src", "data", "catalog.json");

// Ensure the directory exists
const dir = path.dirname(CATALOG_FILE_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Function to read catalog
function getCatalog() {
  try {
    if (fs.existsSync(CATALOG_FILE_PATH)) {
      const rawData = fs.readFileSync(CATALOG_FILE_PATH, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Error reading catalog.json, falling back to default:", error);
  }
  return initialCatalogData;
}

// Function to save catalog
function saveCatalog(data: any) {
  try {
    fs.writeFileSync(CATALOG_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving catalog.json:", error);
    return false;
  }
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Catalog endpoints
app.get("/api/catalog", (req, res) => {
  res.json(getCatalog());
});

app.post("/api/catalog", (req, res) => {
  const newCatalog = req.body;
  if (!newCatalog || typeof newCatalog !== "object") {
    return res.status(400).json({ error: "Invalid catalog format" });
  }
  const success = saveCatalog(newCatalog);
  if (success) {
    res.json({ status: "success", catalog: newCatalog });
  } else {
    res.status(500).json({ error: "Failed to save catalog to server storage" });
  }
});

app.post("/api/catalog/reset", (req, res) => {
  const success = saveCatalog(initialCatalogData);
  if (success) {
    res.json({ status: "success", catalog: initialCatalogData });
  } else {
    res.status(500).json({ error: "Failed to reset catalog" });
  }
});

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
