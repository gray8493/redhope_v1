export const aiService = {
    analyzeTestResult: async (file: File) => {
        // Logic for AI analysis/OCR goes here
        console.log("Analyzing test result...", file.name);
        return { success: true, data: "Analyzed data" };
    },

    analyzeScreening: async (answers: any, userId?: string) => {
        try {
            const bodyPayload = { answers, userId };
            const response = await fetch("/api/ai/screening", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Lỗi kết nối");
            }

            return await response.json();
        } catch (error) {
            console.error("Error in analyzeScreening:", error);
            // Fallback mock logic in case API fails
            return {
                status: "warning",
                score: 50,
                analysis: "Hệ thống AI đang gặp sự cố kết nối, vui lòng thử lại sau.",
                recommendations: ["Kiểm tra kết nối internet", "Thử lại sau ít phút"]
            };
        }
    }
};
