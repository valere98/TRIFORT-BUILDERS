const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const User = require('./models/User');

const initializeDatabase = async () => {
    try {
        // Validate required environment variables
        if (!process.env.MONGO_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error('Missing required environment variables: MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD');
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✓ MongoDB connected');

        // Check if admin user already exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (adminExists) {
            console.log('✓ Admin user already exists, skipping creation');
        } else {
            // Create admin user safely with proper validation
            const adminUser = new User({
                name: process.env.ADMIN_NAME || 'Administrator',
                email: process.env.ADMIN_EMAIL,
                password_hash: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });

            await adminUser.save();
            console.log(`✓ Admin user created successfully (${process.env.ADMIN_EMAIL})`);
        }

        // Close connection
        await mongoose.connection.close();
        console.log('✓ Database initialization complete');
    } catch (error) {
        console.error('✗ Database initialization error:', error.message);
        process.exit(1);
    }
};

initializeDatabase();
