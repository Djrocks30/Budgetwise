document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  loadUpcomingBills();

  document.getElementById("clearBills").addEventListener("click", () => {
    localStorage.removeItem("bills");
    loadUpcomingBills();
  });

  // 🔹 AI Report button
  const aiBtn = document.getElementById("generateAIReport");
  if (aiBtn) {
    aiBtn.addEventListener("click", async () => {
      const tx = JSON.parse(localStorage.getItem("transactions")) || [];
      const summary = tx
        .map(t => `${t.type.toUpperCase()} - ${t.category}: $${t.amount} on ${t.date}`)
        .join("\n");

      const prompt = `Analyze these transactions and provide:
- Top 3 spending categories
- Suggested savings tips
- Weekly forecast insights

${summary}`;

      try {
        const resp = await fetch("https://budgetwise-server-jqzc.onrender.com/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });
        const data = await resp.json();

        console.log("AI proxy raw response:", data);

        const aiText =
          data.response ||
          data.choices?.[0]?.message?.content ||
          data.error ||
          "No AI response received.";

        document.getElementById("aiReportOutput").textContent = aiText;
      } catch (err) {
        console.error("AI report fetch failed:", err);
        document.getElementById("aiReportOutput").textContent =
          "❌ Failed to fetch AI report.";
      }
    });
  }

  //  Chatbox Assistant
  const sendBtn = document.getElementById("sendMessageBtn");
  if (sendBtn) {
    sendBtn.addEventListener("click", async () => {
      const inputEl = document.getElementById("userInput");
      const chatLog = document.getElementById("chatLog");
      const userInput = inputEl.value.trim();
      if (!userInput) return;

      chatLog.innerHTML += `<p>👤 You: ${userInput}</p>`;

      const tx = JSON.parse(localStorage.getItem("transactions")) || [];
      const context = tx.map(t => `${t.type} ${t.category} $${t.amount} on ${t.date}`).join("\n");

      const aiPrompt = `You are a budgeting expert. The user asks: "${userInput}"\nHere are their recent transactions:\n${context}`;

      try {
        const resp = await fetch("https://budgetwise-server-jqzc.onrender.com/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: aiPrompt })
        });
        const data = await resp.json();

        console.log("AI chat raw response:", data);

        const aiMsg =
          data.response ||
          data.choices?.[0]?.message?.content ||
          "❌ Failed to get a reply.";

        chatLog.innerHTML += `<p>🤖 AI: ${aiMsg}</p>`;
        inputEl.value = "";
      } catch (err) {
        console.error("AI chat fetch failed:", err);
        chatLog.innerHTML += `<p>🤖 AI: ❌ Failed to respond.</p>`;
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

