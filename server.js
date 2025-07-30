const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");
const path = require("path"); // Import path module

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from a 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Fungsi untuk bersihin judul file
function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
}

// Halaman utama - Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint Download MP3
app.get("/ytmp3", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("❌ Masukkan URL YouTube!");
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = sanitizeFileName(info.videoDetails.title);
    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    res.header("Content-Type", "audio/mpeg");

    ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    }).pipe(res);
  } catch (err) {
    console.error("YTMP3 Error:", err);
    res.status(500).send("❌ Error download MP3: " + err.message);
  }
});

// Endpoint Download MP4
app.get("/ytmp4", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("❌ Masukkan URL YouTube!");
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = sanitizeFileName(info.videoDetails.title);
    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    res.header("Content-Type", "video/mp4");

    ytdl(url, {
      filter: (format) =>
        format.container === "mp4" && format.hasVideo && format.hasAudio,
      quality: "highest",
    }).pipe(res);
  } catch (err) {
    console.error("YTMP4 Error:", err);
    res.status(500).send("❌ Error download MP4: " + err.message);
  }
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
