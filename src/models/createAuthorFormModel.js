const mongoose = require("mongoose");

const createAuthorFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
    },
    bio: {
        type: String,
        required: [true, "bio is required"],
        minLength: [50, "too short bio"],
        maxLength: [500, "too long bio"],
    },
    phone: {
        type: String,
        required: [true, "phone is required"],
        unique: true,
    },
    profileImg: {
        public_id: String,
        secure_url: String,
    },
    birthday: String,
    gender: {
        type: String,
        enum: ["male", "female"],
    },
}, {timestamps: true});

const CreateAuthorFormModel = mongoose.model('createAuthorForm', createAuthorFormSchema);

module.exports = CreateAuthorFormModel;