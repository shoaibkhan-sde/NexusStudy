const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

const Message = require('./models/Message');

// Socket.io logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (classroomId) => {
        socket.join(classroomId);
    });

    socket.on('send-message', async (data) => {
        try {
            const newMessage = new Message({
                classroomId: data.classroomId,
                sender: data.sender,
                content: data.content
            });
            await newMessage.save();
            io.to(data.classroomId).emit('receive-message', { ...data, _id: newMessage._id });
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('typing', (data) => {
        // data: { classroomId, userName, isTyping }
        socket.to(data.classroomId).emit('user-typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classroom', require('./routes/classroom'));
app.use('/api/resource', require('./routes/resource'));
app.use('/api/search', require('./routes/search'));
app.use('/api/exam', require('./routes/exam'));

// DB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexusstudy';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
