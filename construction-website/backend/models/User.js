const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin', 'editor', 'viewer'] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});


UserSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
        next();
    } catch (error) {
        next(error);
    }
});


UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);

