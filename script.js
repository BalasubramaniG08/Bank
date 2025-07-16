// ====== Common Logic ======
function goBack() {
  window.location.href = "index.html";
}

function getProfile(mobile) {
  const data = localStorage.getItem("customer_" + mobile);
  return data ? JSON.parse(data) : null;
}

function setProfile(mobile, profile) {
  localStorage.setItem("customer_" + mobile, JSON.stringify(profile));
}

function updateTransaction(mobile, type, amount) {
  const profile = getProfile(mobile);
  if (!profile) return;

  if (!Array.isArray(profile.transactions)) {
    profile.transactions = [];
  }

  const transaction = {
    type: type,
    amount: parseFloat(amount),
    time: new Date().toLocaleString("en-IN"),
  };

  profile.transactions.push(transaction);

  if (type === "Deposited") {
    profile.balance += parseFloat(amount);
  } else if (type === "Withdrew" || type === "Transferred") {
    profile.balance -= parseFloat(amount);
  }

  setProfile(mobile, profile);
}

// ====== Registration Page (index.html) Logic ======
function goToCustomer() {
  const mobile = document.getElementById("nextMobile").value;
  const profile = getProfile(mobile);
  if (profile) {
    localStorage.setItem("currentCustomer", mobile);
    window.location.href = "customer.html";
  } else {
    alert("Mobile number not found.");
  }
}

function goToAdmin() {
  const pass = document.getElementById("adminPassword").value;
  if (pass === "1234") {
    localStorage.setItem("adminAccess", "true");
    window.location.href = "admin.html";
  } else {
    alert("Incorrect password");
  }
}

const bankForm = document.getElementById("bankForm");
if (bankForm) {
  bankForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const profile = {
      name: document.getElementById("name").value,
      dob: document.getElementById("dob").value,
      mobile: document.getElementById("mobile").value,
      residence: document.getElementById("residence").value,
      accountType: document.getElementById("accountType").value,
      category: document.querySelector("input[name='category']:checked").value,
      balance: 0,
      transactions: [],
    };
    setProfile(profile.mobile, profile);
    document.getElementById("registrationOutput").innerHTML = `
      <h3>Registered Successfully</h3>
      <p><strong>Name:</strong> ${profile.name}</p>
      <p><strong>Mobile:</strong> ${profile.mobile}</p>
      <p><strong>DOB:</strong> ${profile.dob}</p>
      <p><strong>Address:</strong> ${profile.residence}</p>
      <p><strong>Account Type:</strong> ${profile.accountType}</p>
      <p><strong>Category:</strong> ${profile.category}</p>
      <p><strong>Balance:</strong> ₹0</p>
    `;
    this.reset();
  });
}

// ====== Customer Page Logic (customer.html) ======
const currentCustomer = localStorage.getItem("currentCustomer");

if (document.getElementById("depositForm")) {
  document
    .getElementById("depositForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const amt = parseFloat(document.getElementById("depositAmount").value);
      if (!amt || amt <= 0) return alert("Enter valid amount");
      updateTransaction(currentCustomer, "Deposited", amt);
      document.getElementById("depositOutput").innerText = `Deposited ₹${amt}`;
      this.reset();
    });
}

if (document.getElementById("withdrawForm")) {
  document
    .getElementById("withdrawForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const amt = parseFloat(document.getElementById("withdrawAmount").value);
      if (!amt || amt <= 0) return alert("Enter valid amount");
      const profile = getProfile(currentCustomer);
      if (profile.balance >= amt) {
        updateTransaction(currentCustomer, "Withdrew", amt);
        document.getElementById(
          "withdrawOutput"
        ).innerText = `Withdrew ₹${amt}`;
      } else {
        document.getElementById("withdrawOutput").innerText =
          "Insufficient balance";
      }
      this.reset();
    });
}

if (document.getElementById("transferForm")) {
  document
    .getElementById("transferForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const amt = parseFloat(document.getElementById("transferAmount").value);
      if (!amt || amt <= 0) return alert("Enter valid amount");
      const profile = getProfile(currentCustomer);
      if (profile.balance >= amt) {
        updateTransaction(currentCustomer, "Transferred", amt);
        document.getElementById(
          "transferOutput"
        ).innerText = `Transferred ₹${amt}`;
      } else {
        document.getElementById("transferOutput").innerText =
          "Insufficient balance";
      }
      this.reset();
    });
}

const balanceBtn = document.getElementById("balanceEnquiryBtn");
if (balanceBtn) {
  balanceBtn.addEventListener("click", function () {
    const profile = getProfile(currentCustomer);
    document.getElementById(
      "enquiryOutput"
    ).innerText = `Current Balance: ₹${parseFloat(profile.balance).toFixed(2)}`;
  });
}

const recentTxBtn = document.getElementById("recentTransactionsBtn");
if (recentTxBtn) {
  recentTxBtn.addEventListener("click", function () {
    const profile = getProfile(currentCustomer);
    const txList = profile.transactions;
    let html = `<h3>Recent Transactions</h3><ul>`;
    txList.forEach((tx, index) => {
      html += `<li>#${index + 1} - ${tx.type} ₹${tx.amount} on ${tx.time}</li>`;
    });
    html += `</ul>`;
    document.getElementById("transactionOutput").innerHTML = html;
  });
}

// ====== Admin Page Logic (admin.html) ======
function showTransactions() {
  const mobile = document.getElementById("searchMobile").value.trim();
  if (!mobile) return alert("Please enter mobile number");

  const profile = getProfile(mobile);
  if (
    !profile ||
    !Array.isArray(profile.transactions) ||
    profile.transactions.length === 0
  ) {
    document.getElementById("output").innerHTML =
      "<strong>No recent transactions found.</strong>";
    return;
  }

  let html = `<h3>Recent Transactions for ${profile.name}</h3><ul>`;
  profile.transactions.forEach((tx, index) => {
    html += `<li>#${index + 1} - ${tx.type} ₹${tx.amount} on ${tx.time}</li>`;
  });
  html += "</ul>";
  document.getElementById("output").innerHTML = html;
}

function checkAdminBalance() {
  const mobile = document.getElementById("searchMobile").value.trim();
  if (!mobile) return alert("Enter customer number");

  const profile = getProfile(mobile);
  if (!profile) return alert("Customer not found");

  document.getElementById("output").innerHTML = `<h3>${
    profile.name
  }'s Balance: ₹${parseFloat(profile.balance).toFixed(2)}</h3>`;
}

function showProfile() {
  const mobile = document.getElementById("searchMobile").value.trim();
  if (!mobile) return alert("Please enter mobile number");

  const profile = getProfile(mobile);
  if (!profile) return alert("Customer not found.");

  document.getElementById("output").innerHTML = `
    <strong>Name:</strong> <input type="text" id="editName" value="${profile.name}"><br>
    <strong>DOB:</strong> <input type="date" id="editDob" value="${profile.dob}"><br>
    <strong>Mobile:</strong> <input type="text" id="editMobile" value="${profile.mobile}"><br>
    <strong>Address:</strong> <input type="text" id="editResidence" value="${profile.residence}"><br>
    <strong>Account Type:</strong> <input type="text" id="editAccountType" value="${profile.accountType}"><br>
    <strong>Category:</strong> <input type="text" id="editCategory" value="${profile.category}"><br>
    <strong>Balance:</strong> ₹${profile.balance}
    <div class="edit-delete-btns">
      <button class="edit-btn" onclick="editCustomer('${profile.mobile}')">Save Changes</button>
      <button class="delete-btn" onclick="deleteCustomer('${profile.mobile}')">Delete</button>
    </div>
  `;
}

function editCustomer(originalMobile) {
  const oldProfile = getProfile(originalMobile);
  if (!oldProfile) return;

  const newMobile = document.getElementById("editMobile").value;
  const updatedProfile = {
    ...oldProfile,
    name: document.getElementById("editName").value,
    dob: document.getElementById("editDob").value,
    mobile: newMobile,
    residence: document.getElementById("editResidence").value,
    accountType: document.getElementById("editAccountType").value,
    category: document.getElementById("editCategory").value,
  };

  if (originalMobile !== newMobile) {
    localStorage.removeItem("customer_" + originalMobile);
  }
  setProfile(newMobile, updatedProfile);
  alert("Customer details updated successfully!");
  document.getElementById("searchMobile").value = newMobile;
  showProfile();
}

function deleteCustomer(mobile) {
  if (confirm("Are you sure you want to delete this customer?")) {
    localStorage.removeItem("customer_" + mobile);
    document.getElementById("output").innerHTML =
      "Customer deleted successfully.";
  }
}

function showAllCustomers() {
  const output = document.getElementById("output");
  output.innerHTML = "<h3>All Registered Customers</h3>";

  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith("customer_")
  );
  if (keys.length === 0) {
    output.innerHTML += "<p>No customers found.</p>";
    return;
  }

  keys.forEach((key) => {
    const profile = JSON.parse(localStorage.getItem(key));
    output.innerHTML += `<div class="output-box"><strong>${profile.name}</strong><br>Mobile: ${profile.mobile}</div>`;
  });
}

if (window.location.pathname.includes("admin.html")) {
  if (localStorage.getItem("adminAccess") === "true") {
    window.onload = showAllCustomers;
  } else {
    window.location.href = "index.html";
  }
}
