import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import streamifier from 'streamifier';
import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const server = express();
server.use(express.static('public'));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
server.use(cors());
server.use(express.json());
server.listen(3000, '0.0.0.0', () => {
  console.log(` REST API RUN at PORT 3000`);
});
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'src/pages'));

liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});
server.post('/download', async (req, res) => {
  try {
    console.log('Download request received');

    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
    const { url, cookie } = req.body;

    if (!url || !cookie) {
      return res.status(400).send({ message: 'URL and cookie are required' });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        cookie: cookie,
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the file: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const contentDisposition = response.headers.get('content-disposition');
    const fileName =
      contentDisposition?.match(/filename="?(.+)"?$/)?.[1] ||
      'downloaded-file.mp4';

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    streamifier.createReadStream(buffer).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message || 'Error when fetching the file',
    });
  }
});

server.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || `error when get index`,
    });
  }
});
