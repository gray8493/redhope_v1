export const aiService = {
    analyzeTestResult: async (file: File) => {
        // Logic for AI analysis/OCR goes here
        console.log("Analyzing test result...", file.name);
        return { success: true, data: "Analyzed data" };
    },
};
