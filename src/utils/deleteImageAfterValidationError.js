const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

exports.deleteImageAfterValidationError = async (req) => {
    if (req.body.coverImage) {
        console.log("cover Image deleted")
        const filePath = path.join(__dirname, "../../uploads/products/", req.body.coverImage);
        await fs.unlinkSync(filePath);
    }

    if (req.body.profileImg) {
        console.log("profile image deleted")
        const filePath = path.join(__dirname, "../../uploads/users/", req.body.image);
        await fs.unlinkSync(filePath);
    }

    if (req.body.image) {
        console.log("category delete image")
        const filePath = path.join(__dirname, "../../uploads/categories/", req.body.image);
        await fs.unlinkSync(filePath);
    }

    if (req.body.pdfFile) {
        console.log("PDF deleted")
        const filePath = path.join(__dirname, "../../uploads/products/pdfs/", req.body.pdfFile);
        await fs.unlinkSync(filePath);
    }

    if (req.body.banners) {
        if (typeof req.body.banners === 'string') {
            await cloudinary.uploader.destroy(req.body.banners.public_id);
        } else {
            for (let image in req.body.banners) {
                if (image.public_id) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
        }
    }
}