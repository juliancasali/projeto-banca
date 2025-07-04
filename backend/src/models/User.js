const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50},

    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 4,
        maxLength: 100},

    password: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 100},

    admin: {
        type: Boolean,
        default: false},

    createdAt: {
        type: Date,
        default: Date.now
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
