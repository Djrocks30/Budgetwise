document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ transaction.js loaded");

  // Get all forms and display areas
  const incomeForm = document.getElementById("incomeForm");
  const expenseForm = document.getElementById("expenseForm");
  const billForm = document.getElementById("billForm");
  const transactionList = document.getElementById("transactionList");
  const billList = document.getElementById("billList");

  // Load stored data
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let bills = JSON.parse(localStorage.getItem("bills")) || [];

  // Save functions
  function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  function saveBills() {
    localStorage.setItem("bills", JSON.stringify(bills));
  }

  // Render transaction list
  function renderTransactions() {
    transactionList.innerHTML = "";
    transactions.forEach((transaction, index) => {
      const div = document.createElement("div");
      div.classList.add("transaction-item");
      div.innerHTML = `
        <p><strong>Type:</strong> ${transaction.type}</p>
        <p><strong>Category:</strong> ${transaction.category}</p>
        <p><strong>Amount:</strong> $${parseFloat(transaction.amount).toFixed(2)}</p>
        <p><strong>Date:</strong> ${transaction.date}</p>
        <button onclick="editTransaction(${index})">✏️ Edit</button>
        <button onclick="deleteTransaction(${index})">❌ Delete</button>
      `;
      transactionList.appendChild(div);
    });
  }

  // Render bill list
  function renderBills() {
    billList.innerHTML = "";
    bills.forEach(bill => {
      const div = document.createElement("div");
      div.classList.add("bill-item");
      div.innerHTML = `
        <p><strong>Bill:</strong> ${bill.name}</p>
        <p><strong>Amount:</strong> $${parseFloat(bill.amount).toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${bill.dueDate}</p>
        <p><strong>Repeats Monthly:</strong> ${bill.recurring === "monthly" ? "Yes" : "No"}</p>
      `;
      billList.appendChild(div);
    });
  }

  // Edit / delete for transactions
  window.editTransaction = function (index) {
    const transaction = transactions[index];
    const newAmount = prompt("Edit amount:", transaction.amount);
    if (newAmount !== null && !isNaN(newAmount)) {
      transactions[index].amount = parseFloat(newAmount);
      saveTransactions();
      renderTransactions();
    }
  };

  window.deleteTransaction = function (index) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      transactions.splice(index, 1);
      saveTransactions();
      renderTransactions();
    }
  };

  // Handle income form submit
  incomeForm.addEventListener("submit", e => {
    e.preventDefault();
    const category = document.getElementById("incomeCategory").value;
    const amount = parseFloat(document.getElementById("incomeAmount").value);
    const date = document.getElementById("incomeDate").value;

    if (!isNaN(amount) && date) {
      transactions.push({ type: "income", category, amount, date });
      saveTransactions();
      renderTransactions();
      incomeForm.reset();
    }
  });

  // Handle expense form submit
  expenseForm.addEventListener("submit", e => {
    e.preventDefault();
    const category = document.getElementById("expenseCategory").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const date = document.getElementById("expenseDate").value;

    if (!isNaN(amount) && date) {
      transactions.push({ type: "expense", category, amount, date });
      saveTransactions();
      renderTransactions();
      expenseForm.reset();
    }
  });

  // ✅ Bill form submission
  billForm.addEventListener("submit", e => {
    e.preventDefault();

    const nameInput = document.getElementById("billName");
    const amountInput = document.getElementById("billAmount");
    const dueDateInput = document.getElementById("billDate");
    const recurringInput = document.getElementById("repeatBill");

    if (!nameInput || !amountInput || !dueDateInput || !recurringInput) {
      console.error("❌ One or more bill inputs are missing from DOM.");
      return;
    }

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const dueDate = dueDateInput.value;
    const recurring = recurringInput.checked;

    if (name && !isNaN(amount) && dueDate) {
      const newBill = {
        name,
        amount,
        dueDate,
        recurring: recurring ? "monthly" : "once"
      };

      bills.push(newBill);
      saveBills();
      renderBills();
      billForm.reset();
      alert("✅ Your bill was successfully added!");
    } else {
      alert("❌ Please fill out all fields correctly.");
    }
  });
  
 // Clear All Bills
const clearBillsBtn = document.getElementById("clearBillsBtn");
clearBillsBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all bill reminders?")) {
    bills = [];
    saveBills();
    renderBills();
    alert("🧹 All bills have been cleared!");
  }
});


  // Initial load
  renderTransactions();
  renderBills();
});
