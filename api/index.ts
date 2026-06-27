import express from "express";
import { initialCatalogData } from "../src/data/initialCatalog";
import fs from "fs";
import path from "path";

const app = express();

// Middleware for parsing json and urlencoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// On Vercel, serverless instances have a writable /tmp directory
const CATALOG_FILE_PATH = "/tmp/catalog.json";

// In-memory fallback if writing to /tmp fails or for instant hot-reload
let memoryCatalog = { ...initialCatalogData };

// Initialize from /tmp if exists
try {
  if (fs.existsSync(CATALOG_FILE_PATH)) {
    const rawData = fs.readFileSync(CATALOG_FILE_PATH, "utf-8");
    memoryCatalog = JSON.parse(rawData);
  } else {
    fs.writeFileSync(CATALOG_FILE_PATH, JSON.stringify(initialCatalogData, null, 2), "utf-8");
  }
} catch (err) {
  console.warn("Notice: /tmp filesystem read/write failed, using in-memory state:", err);
}

// Function to read catalog
function getCatalog() {
  try {
    if (fs.existsSync(CATALOG_FILE_PATH)) {
      const rawData = fs.readFileSync(CATALOG_FILE_PATH, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Error reading catalog from /tmp, using memory:", error);
  }
  return memoryCatalog;
}

// Function to save catalog
function saveCatalog(data: any) {
  memoryCatalog = data;
  try {
    fs.writeFileSync(CATALOG_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving catalog to /tmp:", error);
    // Even if /tmp fails, we return true because it is saved in memory for the active session
    return true;
  }
}

// ==========================================
// API ENDPOINTS
// ==========================================

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
    res.status(500).json({ error: "Failed to save catalog" });
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

export default app;
