import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
const PORT = 9000;
const fileDirectory = 'TimeStamp';

app.use(express.json());

const createDirectoryIfNotExists = async () => {
  try {
    await fs.access(fileDirectory);
  } catch (error) {
    await fs.mkdir(fileDirectory);
  }
};

app.get('/', async (req, res) => {
  try {
    await createDirectoryIfNotExists();

    const files = await fs.readdir(fileDirectory, { withFileTypes: true });

    const fileContents = [];
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.txt') && file.name !== 'text.txt') {
        const data = await fs.readFile(path.join(fileDirectory, file.name), 'utf-8');
        fileContents.push({ filename: file.name, content: data });
      }
    }

    console.log('All text files are read successfully');
    res.json(fileContents);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/', async (req, res) => {
  try {
    await createDirectoryIfNotExists();

    const currentTime = new Date().toISOString().replace(/:/g, '_');
    const filename = path.join(fileDirectory, `${currentTime}.txt`);

    await fs.writeFile(filename, currentTime, { flag: 'w+' });
    console.log('File added successfully');

    res.status(201).json({ filename, content: currentTime });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
