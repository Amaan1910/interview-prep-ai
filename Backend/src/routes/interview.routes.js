const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware")
const generateInterviewReport = require("../services/ai.service")

const interviewRouter = Router()

// interviewRouter.post('/interview-report', authMiddleware.authUser, async (req, res) => {
//     try {
//         const report = await generateInterviewReport({
//             resume: req.body.resume,
//             selfDescription: req.body.selfDescription,
//             jobDescription: req.body.jobDescription
//         });
//         return res.status(200).json({ success: true, data: report });
//     } catch (err) {
//         if (err.message === 'COPYRIGHT_FILTER_TRIGGERED') {
//             return res.status(422).json({
//                 success: false,
//                 message: "Couldn't generate the report from this input. Try shortening or paraphrasing the job description/resume text and retry."
//             });
//         }
//         console.error('generateInterviewReport failed:', err);
//         return res.status(500).json({ success: false, message: 'Something went wrong generating the report.' });
//     }
// });

interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController)

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)

module.exports = interviewRouter