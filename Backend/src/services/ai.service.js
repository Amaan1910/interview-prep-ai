const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportJsonSchema = {
    type: "object",
    properties: {
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The technical question can be asked in the interview" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"],
                maxLength: 400
            },
            minItems: 5,
            maxItems: 8,
            description: "Technical questions that can be asked in the interview, along with their intention and how to answer them"
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The behavioral question can be asked in the interview" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"],
                maxLength: 400
            },
            minItems: 5,
            maxItems: 8,
            description: "Behavioral questions that can be asked in the interview, along with their intention and how to answer them"
        },
        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "The skill that the candidate is lacking" },
                    severity: { type: "string", enum: [ "low", "medium", "high" ], description: "The severity of the skill gap" },
                },
                required: ["skill", "severity"],
                maxLength: 400
            },
            minItems: 0,
            maxItems: 5,
            description: "List of skill gaps that the candidate has, along with their severity"
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "number", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "string", description: "The main focus of this day in the preparation plan, what the candidate should focus on" },
                    tasks: { type: "array", items: { type: "string" }, description: "List of tasks to be completed on this day" }
                },
                required: ["day", "focus", "tasks"],
                maxLength: 400
            },
            minItems: 7,
            maxItems: 30,
            description: "The preparation plan for the candidate, broken down by day, with the main focus and tasks for each day"
        },
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated"
        }
    },
    required: [ "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title" ]
}

const interviewReportSchema = z.fromJSONSchema(interviewReportJsonSchema);

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
        You are an AI assistant that generates an interview report for a candidate based on their resume, self-description, and the job description. The report should include a match score, technical questions, behavioral questions, skill gaps, and a preparation plan.

        The match score should be a number between 0 and 100 indicating how well the candidate's profile matches the job description.

        The technical questions should be a list of questions that can be asked in the interview, along with their intention and how to answer them.

        The behavioral questions should be a list of questions that can be asked in the interview, along with their intention and how to answer them.

        The skill gaps should be a list of skills that the candidate is lacking, along with their severity (low, medium, high).

        The preparation plan should be broken down by day, with the main focus and tasks for each day.

        Please generate the interview report in JSON format according to the schema provided.
        ${resume ? `Resume: ${resume}` : ""}
        ${selfDescription ? `Self-Description: ${selfDescription}` : ""}
        ${jobDescription ? `Job-Description: ${jobDescription}` : ""}
        `

    try {
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: prompt,
            response_format: {
                type: 'text',
                mime_type: 'application/json',
                schema: interviewReportJsonSchema
            },
        });
        const report = interviewReportSchema.parse(JSON.parse(interaction.output_text));
        return report;
    } catch (err) {
        if (err.status === 400 && err.error?.error?.message?.includes('copyright')) {
            throw new Error('COPYRIGHT_FILTER_TRIGGERED');
        }
        throw err;
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
        format: 'A4',
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '15mm',
            left: '15mm'
        }
    });
    await browser.close();
    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a professional resume as a complete, standalone HTML document (including a <style> block for formatting).
        ${resume ? `Resume: ${resume}` : ""}
        ${selfDescription ? `Self-Description: ${selfDescription}` : ""}
        ${jobDescription ? `Job-Description: ${jobDescription}` : ""}
        The content of the resume should not sound like generated by AI. It should be professional and as close as possible to a human-written resume. The HTML should be clean and well-formatted, ready to be converted into a PDF.
        You can highlight the skills and experience of the candidate in a way that is visually appealing and easy to read. Use bullet points, headings, and other formatting techniques to make the resume stand out. The resume should be tailored to the job description provided, emphasizing the most relevant skills and experiences.
        You can highlight the content using some colors or different font styles, but make sure it looks professional and not too flashy. The resume should be concise and to the point, focusing on the most important information that will help the candidate stand out to potential employers.
        The content should be ATS friendly, meaning it should be easily readable by applicant tracking systems. Avoid using images or graphics that may not be parsed correctly by ATS software. The resume should be optimized for both human readers and ATS systems, ensuring that the candidate's qualifications are effectively communicated to potential employers.
        The resume should not be so lengthy that it becomes overwhelming or difficult to read. It should be ideally 1-2 pages long. Focus on the most important information and present it in a clear and organized manner. The resume should be tailored to the specific job description provided, highlighting the skills and experiences that are most relevant to the position.`

    try {
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: prompt,
            response_format: { type: 'text' },
        });

        let html = interaction.output_text.trim();
        html = html.replace(/^```html\s*/i, '').replace(/```$/,'').trim();

        const pdfBuffer = await generatePdfFromHtml(html);
        return pdfBuffer;
    } catch (err) {
        console.error('Gemini API error:', JSON.stringify(err, null, 2));
        if (err.response?.status === 429) {
            setError("We're experiencing high demand right now. Please try again in a few minutes.")
        } else {
            setError("Something went wrong while generating your resume PDF. Please try again.")
        }
    }
}

module.exports = { generateInterviewReport, generateResumePdf };