const multer = require("multer");
const Tesseract = require("tesseract.js");

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const ScamReport = require("../models/ScamReport");

const upload = multer({
    dest: "uploads/"
});

// =========================
// Scam Detection API
// =========================
router.post("/analyze", authMiddleware, async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const scamKeywords = [
            "otp",
            "password",
            "upi",
            "bank",
            "click link",
            "reward",
            "winner",
            "prize",
            "urgent",
            "verify"
        ];

        let risk = "Low";
        let detected = [];

        scamKeywords.forEach(word => {
            if (message.toLowerCase().includes(word)) {
                detected.push(word);
            }
        });

        if (detected.length >= 3) {
            risk = "High";
        } else if (detected.length > 0) {
            risk = "Medium";
        }

        const report = await ScamReport.create({
            userId: req.user.id,
            message,
            risk,
            detectedKeywords: detected,
            isScam: risk !== "Low"
        });

        res.status(200).json({
            success: true,
            message: "Scam analysis completed",
            report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

// =========================
// Scam History API
// =========================
router.get("/history", authMiddleware, async (req, res) => {

    try {

        const reports = await ScamReport.find({
            userId: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            history: reports
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// Scam Statistics API
router.get("/stats", authMiddleware, async (req, res) => {

    try {

        const totalScans = await ScamReport.countDocuments({
            userId: req.user.id
        });


        const scamDetected = await ScamReport.countDocuments({
            userId: req.user.id,
            isScam: true
        });


        const highRisk = await ScamReport.countDocuments({
            userId: req.user.id,
            risk: "High"
        });


        const safeMessages = await ScamReport.countDocuments({
            userId: req.user.id,
            isScam: false
        });


        res.status(200).json({

            success: true,

            stats: {
                totalScans,
                scamDetected,
                highRisk,
                safeMessages
            }

        });


    } catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

// URL Scam Detection API
router.post("/url-check", authMiddleware, async (req, res) => {

    try {

        const { url } = req.body;


        if(!url){

            return res.status(400).json({

                success:false,

                message:"URL is required"

            });

        }


        const suspiciousKeywords = [
            "login",
            "verify",
            "bank",
            "otp",
            "reward",
            "prize",
            "free",
            "gift",
            "update",
            "secure"
        ];


        let detected = [];


        suspiciousKeywords.forEach(word => {

            if(url.toLowerCase().includes(word)){

                detected.push(word);

            }

        });



        let risk = "Low";


        if(detected.length >= 2){

            risk = "High";

        }

        else if(detected.length > 0){

            risk = "Medium";

        }



        res.status(200).json({

            success:true,

            result:{

                url,

                risk,

                detectedKeywords: detected,

                isScam: risk !== "Low"

            }

        });



    } catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});


// Image Scam Detection API
router.post(
"/image-check",
authMiddleware,
upload.single("image"),
async(req,res)=>{

    try{

        if(!req.file){

            return res.status(400).json({

                success:false,
                message:"Image required"

            });

        }


        const result = await Tesseract.recognize(
            req.file.path,
            "eng"
        );


        const text = result.data.text;


        const scamKeywords = [
            "otp",
            "password",
            "bank",
            "upi",
            "verify",
            "reward",
            "winner",
            "prize",
            "urgent",
            "click"
        ];


        let detected=[];


        scamKeywords.forEach(word=>{

            if(text.toLowerCase().includes(word)){

                detected.push(word);

            }

        });



        let risk="Low";


        if(detected.length>=3){

            risk="High";

        }
        else if(detected.length>0){

            risk="Medium";

        }



        res.status(200).json({

            success:true,

            result:{

                extractedText:text,

                risk,

                detectedKeywords:detected,

                isScam:risk!=="Low"

            }

        });


    }
    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

module.exports = router;