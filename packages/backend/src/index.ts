import express from 'express';
import cors from 'cors';
import path from 'path';
import { imageRoutes } from './routes/images';
import { folderRoutes } from './routes/folders';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/images', imageRoutes);
app.use('/api/folders', folderRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'D&D Map Buddy API is running' });
});

app.listen(PORT, () => {
    console.log(`🎲 D&D Map Buddy API running on port ${PORT}`);
    console.log(`📁 Upload directory: ${path.join(__dirname, '../uploads')}`);
});
