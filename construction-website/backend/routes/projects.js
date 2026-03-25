const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});


router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ created_at: -1 });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});


router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, location, completion_date, status } = req.body;
        
        if (!title || !description || !category) {
            return res.status(400).json({ error: 'Title, description, and category are required' });
        }
        
        const newProject = new Project({
            title,
            description,
            category,
            location,
            completion_date,
            status: status || 'ongoing',
            image: req.file ? req.file.filename : null
        });
        
        await newProject.save();
        res.json({ 
            success: true, 
            message: 'Project created successfully',
            project: newProject
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});


router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, image, location, completion_date } = req.body;
        
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { title, description, image, location, completion_date },
            { new: true }
        );
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});


router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Project deleted successfully',
            project
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;

