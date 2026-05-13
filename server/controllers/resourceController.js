const Resource = require('../models/Resource');

exports.uploadResource = async (req, res) => {
    try {
        console.log("Upload request received:", req.body);
        console.log("File received:", req.file);

        const { classroomId, type, title, tags } = req.body;
        
        if (!classroomId || !type || !title) {
            return res.status(400).json({ msg: 'Missing required fields: classroomId, type, or title' });
        }

        // Handle tags: convert to array if it's a string
        let tagsArray = [];
        if (tags) {
            tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
        }

        const newResource = new Resource({
            classroomId,
            type,
            title,
            fileUrl: req.file ? req.file.path : req.body.fileUrl, // Cloudinary uses .path
            uploadedBy: req.user,
            tags: tagsArray,
            isPinned: false
        });

        const savedResource = await newResource.save();
        console.log("Resource saved successfully:", savedResource._id);
        res.json(savedResource);
    } catch (err) {
        console.error("FULL UPLOAD ERROR:", err); // This will show the actual error in terminal
        res.status(500).json({ error: err.message || 'Server error during upload' });
    }
};

exports.getClassroomResources = async (req, res) => {
    try {
        const resources = await Resource.find({ classroomId: req.params.classroomId }).populate('uploadedBy', 'name');
        res.json(resources);
    } catch (err) {
        console.error("GET RESOURCES ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};
