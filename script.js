// Simulated current user
const currentUser = {
  name: "Guest User",
  email: "guest@doctrack.local",
};

// Load documents
function loadDocs() {
  const stored = localStorage.getItem("docuTrackDocs");
  return stored ? JSON.parse(stored) : [];
}

function saveDocs(docs) {
  localStorage.setItem("docuTrackDocs", JSON.stringify(docs));
}

// Upload form
document.getElementById("uploadForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const docTitle = document.getElementById("docTitle").value.trim();
  const docType = document.getElementById("docType").value.trim();
  const issuedBy = document.getElementById("issuedBy").value.trim();
  const docNumber = document.getElementById("docNumber").value.trim();
  const issueDate = document.getElementById("issueDate").value;
  const holderName = document.getElementById("holderName").value.trim();
  const fileName = document.getElementById("fileName").value.trim();
  const remarks = document.getElementById("remarks").value.trim();

  if (
    !docTitle ||
    !docType ||
    !issuedBy ||
    !docNumber ||
    !issueDate ||
    !holderName ||
    !fileName
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const docs = loadDocs();
  const verificationId = "DT-" + Date.now();

  const newDoc = {
    verificationId,
    docTitle,
    docType,
    issuedBy,
    docNumber,
    issueDate,
    holderName,
    fileName,
    remarks,
    status: "Pending", // Pending, Verified, Rejected
    uploadedBy: currentUser.email,
    uploadedAt: new Date().toISOString(),
    verifiedAt: null,
    verifiedBy: null,
  };

  docs.push(newDoc);
  saveDocs(docs);

  alert(`Document uploaded successfully!\nVerification ID: ${verificationId}`);
  document.getElementById("uploadForm").reset();
  renderDocs();
  renderAdminDocs();
});

// Render user docs (dashboard)
function renderDocs() {
  const docs = loadDocs();
  const container = document.getElementById("docsContainer");

  const myDocs = docs.filter((d) => d.uploadedBy === currentUser.email);

  if (myDocs.length === 0) {
    container.innerHTML = "<p>No documents uploaded yet.</p>";
    return;
  }

  container.innerHTML = "";
  myDocs.forEach((d) => {
    const card = document.createElement("div");
    card.className = "doc-card";

    const statusClass =
      d.status === "Verified"
        ? "status-verified"
        : d.status === "Rejected"
        ? "status-rejected"
        : "status-pending";

    card.innerHTML = `
      <div class="doc-header">
        <div class="doc-title">${d.docTitle}</div>
        <span class="status-badge ${statusClass}">${d.status}</span>
      </div>
      <div class="doc-meta">
        Type: ${d.docType} | Number: ${d.docNumber}<br/>
        Issued By: ${d.issuedBy} | Issue Date: ${d.issueDate}<br/>
        Holder: ${d.holderName}<br/>
        File: ${d.fileName}<br/>
        Verification ID: ${d.verificationId}<br/>
        Uploaded: ${new Date(d.uploadedAt).toLocaleString()}
        ${d.verifiedAt ? `<br/>Verified: ${new Date(d.verifiedAt).toLocaleString()} by ${d.verifiedBy}` : ""}
      </div>
    `;

    container.appendChild(card);
  });
}

// Verify form (public)
document.getElementById("verifyForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const verifyId = document.getElementById("verifyId").value.trim();
  const resultBox = document.getElementById("verifyResult");

  if (!verifyId) {
    alert("Please enter a Verification ID.");
    return;
  }

  const docs = loadDocs();
  const doc = docs.find((d) => d.verificationId === verifyId);

  resultBox.style.display = "block";

  if (!doc) {
    resultBox.innerHTML = `
      <div class="result-title">No document found for this Verification ID.</div>
    `;
    return;
  }

  const statusClass =
    doc.status === "Verified"
      ? "status-verified"
      : doc.status === "Rejected"
      ? "status-rejected"
      : "status-pending";

  resultBox.innerHTML = `
    <div class="result-title">
      Document Found
      <span class="status-badge ${statusClass}">${doc.status}</span>
    </div>
    <div class="result-details">
      <strong>Title:</strong> ${doc.docTitle}<br/>
      <strong>Type:</strong> ${doc.docType}<br/>
      <strong>Number:</strong> ${doc.docNumber}<br/>
      <strong>Issued By:</strong> ${doc.issuedBy}<br/>
      <strong>Issue Date:</strong> ${doc.issueDate}<br/>
      <strong>Holder:</strong> ${doc.holderName}<br/>
      <strong>File:</strong> ${doc.fileName}<br/>
      <strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleString()}
      ${doc.verifiedAt ? `<br/><strong>Verified:</strong> ${new Date(doc.verifiedAt).toLocaleString()} by ${doc.verifiedBy}` : ""}
    </div>
  `;
});

// Admin: render pending docs
function renderAdminDocs() {
  const docs = loadDocs();
  const container = document.getElementById("adminDocsContainer");

  const pendingDocs = docs.filter((d) => d.status === "Pending");

  if (pendingDocs.length === 0) {
    container.innerHTML = "<p>No pending documents.</p>";
    return;
  }

  container.innerHTML = "";
  pendingDocs.forEach((d) => {
    const card = document.createElement("div");
    card.className = "doc-card";

    card.innerHTML = `
      <div class="doc-header">
        <div class="doc-title">${d.docTitle}</div>
        <span class="status-badge status-pending">Pending</span>
      </div>
      <div class="doc-meta">
        Type: ${d.docType} | Number: ${d.docNumber}<br/>
        Issued By: ${d.issuedBy} | Issue Date: ${d.issueDate}<br/>
        Holder: ${d.holderName}<br/>
        File: ${d.fileName}<br/>
        Verification ID: ${d.verificationId}<br/>
        Uploaded: ${new Date(d.uploadedAt).toLocaleString()} by ${d.uploadedBy}
      </div>
      <div class="doc-actions">
        <button class="verify-btn" data-id="${d.verificationId}">Verify</button>
        <button class="reject-btn" data-id="${d.verificationId}">Reject</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Verify / Reject handlers
  container.querySelectorAll(".verify-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDocStatus(btn.dataset.id, "Verified");
    });
  });

  container.querySelectorAll(".reject-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDocStatus(btn.dataset.id, "Rejected");
    });
  });
}

// Update document status
function updateDocStatus(verificationId, newStatus) {
  const docs = loadDocs();
  const doc = docs.find((d) => d.verificationId === verificationId);

  if (!doc) {
    alert("Document not found.");
    return;
  }

  const verifierName = prompt(`Enter verifier name to mark as ${newStatus}:`);
  if (!verifierName) return;

  doc.status = newStatus;
  doc.verifiedAt = new Date().toISOString();
  doc.verifiedBy = verifierName;

  saveDocs(docs);
  alert(`Document marked as ${newStatus}.`);
  renderAdminDocs();
  renderDocs();
}

// Initialize
renderDocs();
renderAdminDocs();