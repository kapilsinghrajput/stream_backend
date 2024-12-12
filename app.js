import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { createReadStream, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const { PORT } = process.env;


const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/video", (req, res) => {
  const filePath = join(_dirname, "public", "/10739358-hd_1920_1080_24fps.mp4");

  try {
    const stat = statSync(filePath);
    const fileSize = stat.size;

    const range = req.headers.range; // Ensure correct case sensitivity for `req.headers.range`
    if (!range) {
      return res.status(400).send("Range header is required");
    }

    const chunkSize = 10 ** 6; // 1MB chunks
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      // "Content-Type": "video/webm", // Adjust MIME type as needed
      "Content-Type": "video/mp4", // Adjust MIME type as needed
    };

    res.writeHead(206, headers);

    const fileStream = createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving video:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
