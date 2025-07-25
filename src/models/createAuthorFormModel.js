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
    },
    phone: {
        type: String,
        required: [true, "phone is required"],
        unique: true,
    },
    profileImg: {
        type:String
    },
    birthday: String,
    gender: {
        type: String,
        enum: ["male", "female"],
    },
}, {timestamps: true});

const CreateAuthorFormModel = mongoose.model('createAuthorForm', createAuthorFormSchema);

module.exports = CreateAuthorFormModel;