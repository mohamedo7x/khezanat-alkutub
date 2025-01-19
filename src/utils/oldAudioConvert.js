const pdf = require('pdf-parse');
const gTTs = require('gtts');
const ProductModel = require('../models/productModel')
async function convertPdfToText (file) {
    if(!file){
        return new Error('File Is not exisit');
    }
    const ConvertedPDF = await pdf(file);

    return ConvertedPDF.text;
}


async function getDetailsOfPDF (file) {
    if(!file){
        return new Error('File Is not exisit');
    }
    const PDF = await pdf(file);
    return PDF;
}
async function UpdateProductOnDb(pdfPath, pdfAudioName) {
    try {
        const updatePath = await ProductModel.findOneAndUpdate(
            { pdfFile: pdfPath },
            { $set: { pdfAudio: pdfAudioName } },
            { new: true }
        );
        return updatePath;
    } catch (error) {
        console.error("Error updating product in database:", error.message);
        throw error;
    }
}
async function convertTextToAudio(text, language, path , pdfPath , pdfAudioName) {
    const gtts = new gTTs(text, language);

    return new Promise((resolve, reject) => {
        gtts.save(path, async (err, result) => {
            if (err) {
                console.error("Error converting text to audio:", err.message);
                reject(new Error("Failed to convert string to audio"));
                return;
            }

            try {
                const updatePath = await UpdateProductOnDb(pdfPath, pdfAudioName);
                resolve(updatePath);
            } catch (dbError) {
                reject(dbError);
            }
        });
    });
}

exports.convertPdfToText = convertPdfToText;
exports.getDetailsOfPDF = getDetailsOfPDF;
exports.convertTextToAudio = convertTextToAudio;