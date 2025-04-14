const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const CompilerEngine = require('./compiler_engine');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});


const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /csv|json|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log(`MIME type: ${file.mimetype}, Extension: ${path.extname(file.originalname)}`); // Debugging

    if (mimetype && extname) cb(null, true);
    else cb(new Error('Only CSV, JSON, and PDF files allowed.'));
  }
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.get('/', (req, res) => {
  res.send('Welcome to the file upload and compiler server!');
});

app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).send('No files uploaded.');
  res.status(200).send({ message: 'Files uploaded successfully!', files: req.files });
});

app.post('/compile', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).send({ error: "No code provided." });

  const compiler = new CompilerEngine();
  const result = await compiler.process(code);
  if (result.success) res.status(200).send({ output: result.output });
  else res.status(400).send({ error: result.error });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
