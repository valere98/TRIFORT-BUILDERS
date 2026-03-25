const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const User = require('./models/User');

const initializeDatabase = async () => {
    try {
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected');

        
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (adminExists) {
            console.log('Admin user already exists');
        } else {
            
            const adminUser = new User({
                name: process.env.ADMIN_NAME || 'Administrator',
                email: process.env.ADMIN_EMAIL,
                password_hash: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });

            await adminUser.save();
            console.log("INPUT:", req.body);
            console.log("DB USER:", user);
            console.log("DB PASSWORD:", user?.password_hash);
        }

        mongoose.connection.close();
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
};

initializeDatabase();
