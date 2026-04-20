const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase'); // ← replace Project model
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validateProjectData, sanitizeObject } = require('../utils/validators');

// Configure multer for file uploads (unchanged)
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
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// GET: Fetch all projects (public endpoint)
router.get('/', async (req, res) => {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('✗ Supabase fetch error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch projects' });
        }

        res.json(projects);
    } catch (error) {
        console.error('✗ Error fetching projects:', error.message);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET: Fetch single project (public endpoint)
router.get('/:id', async (req, res) => {
    try {
        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('✗ Error fetching project:', error.message);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST: Create project (admin/editor only)
router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, location, completion_date, status } = req.body;

        // Validate project data
        const validation = validateProjectData({ title, description, category, status });
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                errors: validation.errors 
            });
        }

        // Sanitize inputs
        const sanitized = sanitizeObject(
            { title, description, category, location },
            ['title', 'description', 'category', 'location']
        );

        const imageUrl = req.file 
            ? `/uploads/${req.file.filename}` 
            : null;

        const { data: newProject, error } = await supabase
            .from('projects')
            .insert([{
                title: sanitized.title,
                description: sanitized.description,
                category: sanitized.category,
                location: sanitized.location || '',
                completion_date: completion_date || null,
                status: status?.toLowerCase() || 'ongoing',
                image: imageUrl,
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) {
            console.error('✗ Supabase insert error:', error.message);
            return res.status(500).json({ error: 'Failed to create project' });
        }

        console.log('✓ Project created by', req.user.email, ':', newProject.title);

        res.json({ 
            success: true, 
            message: 'Project created successfully',
            project: newProject
        });
    } catch (error) {
        console.error('✗ Error creating project:', error.message);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PUT: Update project (admin/editor only)
router.put('/:id', adminMiddleware, async (req, res) => {
    try {
        const { title, description, image, location, completion_date, status } = req.body;

        // Validate updated data
        const validation = validateProjectData({ title, description, category: 'dummy', status });
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                errors: validation.errors 
            });
        }

        // Sanitize inputs
        const sanitized = sanitizeObject(
            { title, description, location },
            ['title', 'description', 'location']
        );

        const updateData = {
            title: sanitized.title,
            description: sanitized.description,
            location: sanitized.location
        };

        if (image) updateData.image = image;
        if (completion_date) updateData.completion_date = completion_date;
        if (status) updateData.status = status.toLowerCase();

        const { data: project, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log('✓ Project updated by', req.user.email, ':', project.title);

        res.json({ 
            success: true, 
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('✗ Error updating project:', error.message);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE: Remove project (admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const { data: project, error } = await supabase
            .from('projects')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log('✓ Project deleted by', req.user.email, ':', project.title);

        res.json({ 
            success: true, 
            message: 'Project deleted successfully',
            project
        });
    } catch (error) {
        console.error('✗ Error deleting project:', error.message);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;