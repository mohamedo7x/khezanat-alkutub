const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "too short password"],
    },
    phone: {
        type: String,
        required: [true, "phone is required"],
        unique: true,
    },
    profileImg: {
        type: String,
    },
    address: String,
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    roles: [
        {
            type: String,
            required: [true, "role is required"],
            enum: ["controlAdmins", "controlUsers","controlAuthor", "controlCategory", "controlProduct", "controlOrder", "controlApp"],
        }
    ],
    passwordChangedAt: Date,
}, {timestamps: true});

const AdminModel = mongoose.model('admin', adminSchema);

module.exports = AdminModel;