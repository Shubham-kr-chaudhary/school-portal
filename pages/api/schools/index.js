import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
import { getPool } from "../../../lib/db.js"; 
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const config = { api: { bodyParser: false } };


if (process.env.CLOUDINARY_ENABLED === "true") {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}


const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "school_images" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });


let uploadDir = null;
if (process.env.CLOUDINARY_ENABLED !== "true") {
  uploadDir = path.join(process.cwd(), "public", "schoolImages");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, address, city, state, contact, email_id, image, created_at FROM schools ORDER BY id DESC"
      );
      res.status(200).json(rows);
    } catch (err) {
      console.error("DB error (GET):", err);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  if (req.method === "POST") {
    const form = new IncomingForm({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Upload error" });
      }

      try {
        const name = fields.name || "";
        const address = fields.address || "";
        const city = fields.city || "";
        const state = fields.state || "";
        const contact = fields.contact || "";
        const email_id = fields.email_id || "";

        let imagePathOrUrl = null;

        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image;
          const tempPath = file.filepath || file.path;

          if (tempPath) {
            const buffer = fs.readFileSync(tempPath);
            const ext = path.extname(file.originalFilename || file.name) || ".jpg";

            if (process.env.CLOUDINARY_ENABLED === "true") {
              const result = await uploadToCloudinary(buffer);
              imagePathOrUrl = result.secure_url;
            } else if (uploadDir) {
              const filename = `${uuidv4()}${ext}`;
             const dest = path.join(uploadDir, filename);
             fs.copyFileSync(tempPath, dest);
             imagePathOrUrl = `/schoolImages/${filename}`;
            }
          }
        }

        const sql = `INSERT INTO schools (name, address, city, state, contact, image, email_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [
          name,
          address,
          city,
          state,
          contact,
          imagePathOrUrl,
          email_id,
        ];
        const [result] = await pool.query(sql, params);

        res.status(201).json({ id: result.insertId });
      } catch (err) {
        console.error("Server error (POST):", err);
        res.status(500).json({ error: "Server error" });
      }
    });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

