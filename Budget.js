const OPENAI_API_KEY = "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"; //

document.addEventListener("DOMContentLoaded", function () {
    updateDashboard();
    loadUpcomingBills();

    document.getElementById("clearBills").addEventListener("click", () => {
        localStorage.removeItem("bills");
        loadUpcomingBills();
    });

    const aiReportBtn = document.getElementById("generateAIReport");
    if (aiReportBtn) {
        aiReportBtn.addEventListener("click", async () => {
            const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
            const summaryText = transactions.map(t => `${t.type.toUpperCase()} - ${t.category}: $${t.amount} on ${t.date}`).join('\n');
            const prompt = `Analyze these transactions and provide:
            - Top 3 spending categories
            - Suggested savings tips
            - Weekly forecast based on spending patterns\n\nTransactions:\n${summaryText}`;

            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4",
                        messages: [
                            { role: "system", content: "You are a professional budget assistant helping users improve their finances." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.7
                    })
                });

                const data = await response.json();
                document.getElementById("aiReportOutput").textContent = data.choices?.[0]?.message?.content || "No AI response received.";
            } catch (error) {
                console.error("AI report generation failed:", error);
                document.getElementById("aiReportOutput").textContent = "❌ Failed to fetch AI report.";
            }
        });
    }

    const sendMessageBtn = document.getElementById("sendMessageBtn");
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener("click", async () => {
            const userInput = document.getElementById("userInput").value.trim();
            if (!userInput) return;

            const chatLog = document.getElementById("chatLog");
            const userMessage = document.createElement("p");
            userMessage.textContent = `👤 You: ${userInput}`;
            chatLog.appendChild(userMessage);

            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4",
                        messages: [
                            { role: "system", content: "You are a friendly budgeting coach helping the user with financial questions." },
                            { role: "user", content: userInput }
                        ],
                        temperature: 0.7
                    })
                });

                const data = await response.json();
                const aiMessage = document.createElement("p");
                aiMessage.textContent = `🤖 AI: ${data.choices?.[0]?.message?.content}`;
                chatLog.appendChild(aiMessage);
                document.getElementById("userInput").value = "";
            } catch (error) {
                const errorMessage = document.createElement("p");
                errorMessage.textContent = "🤖 AI: ❌ Failed to respond.";
                chatLog.appendChild(errorMessage);
            }
        });
    }
});

// Dashboard update functions
function updateDashboard() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    let totalIncome = 0;
    let totalExpenses = 0;
    let categoryTotals = { Rent: 0, Groceries: 0, Entertainment: 0, Transport: 0, Others: 0 };
    let weeklyTrends = {};

    transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        const category = transaction.category || "Others";
        const type = transaction.type.toLowerCase();
        const date = new Date(transaction.date);
        const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;

        if (type === "income") {
            totalIncome += amount;
        } else if (type === "expense") {
            totalExpenses += amount;
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            weeklyTrends[weekKey] = (weeklyTrends[weekKey] || 0) + amount;
        }
    });

    const balance = totalIncome - totalExpenses;
    document.getElementById("dashboardTotalIncome").textContent = totalIncome.toFixed(2);
    document.getElementById("dashboardTotalExpenses").textContent = totalExpenses.toFixed(2);
    document.getElementById("dashboardRemainingBalance").textContent = balance.toFixed(2);

    updateExpenseChart(categoryTotals);
    updateTrendChart(weeklyTrends);
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDayOfYear) / 86400000);
    return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
}

function updateExpenseChart(categoryTotals) {
    const ctx = document.getElementById("expenseChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ["#2ecc71", "#27ae60", "#1e8449", "#145A32", "#0B3D02"]
            }]
        }
    });
}

function updateTrendChart(weeklyData) {
    const ctx = document.getElementById("trendChart").getContext("2d");
    const sortedWeeks = Object.keys(weeklyData).sort();
    const values = sortedWeeks.map(week => weeklyData[week]);

    new Chart(ctx, {
        type: "line",
        data: {
            labels: sortedWeeks,
            datasets: [{
                label: "Weekly Expenses",
                data: values,
                borderColor: "#27ae60",
                fill: false
            }]
        }
    });
}

function loadUpcomingBills() {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];
    const billList = document.getElementById("upcomingBills");
    billList.innerHTML = "";

    if (bills.length === 0) {
        billList.innerHTML = "<p>No upcoming bills</p>";
        return;
    }

    bills.forEach(bill => {
        const item = document.createElement("p");
        item.textContent = `${bill.name} - $${bill.amount} (Due: ${bill.dueDate})`;
        billList.appendChild(item);
    });
}
