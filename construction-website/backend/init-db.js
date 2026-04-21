const bcryptjs = require('bcryptjs');
const supabase = require('./config/supabase');
require('dotenv').config({ path: '../../.env' });

const initializeDatabase = async () => {
    try {
        // Validate required environment variables
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
        }

        console.log('✓ Supabase connected');

        // Check if admin user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', process.env.ADMIN_EMAIL)
            .single();

        if (existingUser) {
            console.log('✓ Admin user already exists, skipping creation');
        } else if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Error checking for existing user: ${checkError.message}`);
        } else {
            // Hash the password before storing
            const passwordHash = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 10);

            // Create admin user in Supabase
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        name: process.env.ADMIN_NAME || 'Administrator',
                        email: process.env.ADMIN_EMAIL,
                        password_hash: passwordHash,
                        role: 'admin'
                    }
                ])
                .select();

            if (insertError) {
                throw new Error(`Error creating admin user: ${insertError.message}`);
            }

            console.log(`✓ Admin user created successfully (${process.env.ADMIN_EMAIL})`);
        }

        console.log('✓ Database initialization complete');
    } catch (error) {
        console.error('✗ Database initialization error:', error.message);
        process.exit(1);
    }
};

initializeDatabase();
