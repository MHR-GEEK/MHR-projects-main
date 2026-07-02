const loginForm = document.querySelector("#loginForm");
const brandForm = document.querySelector("#brandForm");
const scanForm = document.querySelector("#scanForm");
const imageInput = document.querySelector("#imageInput");
const preview = document.querySelector("#preview");
const adminMessage = document.querySelector("#adminMessage");
const scanMessage = document.querySelector("#scanMessage");
const brandList = document.querySelector("#brandList");
const resultBox = document.querySelector("#result");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatLog = document.querySelector("#chatLog");
const chatMessage = document.querySelector("#chatMessage");
const adminToggle = document.querySelector("#adminToggle");
const adminPanel = document.querySelector("#adminPanel");

function setMessage(node, message, isError = false) {
  node.textContent = message;
  node.classList.toggle("error", isError);
}

function renderBrands(brands) {
  brandList.innerHTML = "";
  brands.forEach((brand) => {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.dataset.brand = brand;
    button.textContent = `${brand} x`;
    brandList.appendChild(button);
  });
}

function renderList(items) {
  return items.map((item) => `<li>${item}</li>`).join("") || "<li>-</li>";
}

function renderResult(result) {
  const concerns = Array.isArray(result.concerns) ? result.concerns : [];
  const routine = Array.isArray(result.routine) ? result.routine : [];
  const proportions = Array.isArray(result.proportion_notes) ? result.proportion_notes : [];

  resultBox.className = "result has-result";
  resultBox.innerHTML = `
    <div class="facts">
      <div><span>Skin Type</span><strong>${result.skin_type || "-"}</strong></div>
      <div><span>Sensitivity</span><strong>${result.sensitivity || "-"}</strong></div>
      <div><span>AI Status</span><strong>${result.ai_available ? "Active" : "Not configured"}</strong></div>
    </div>
    <div class="score-grid auto-scale">
      <div class="score-card">
        <span>PSL Style Scale</span>
        <strong>${result.psl_score || "-"}</strong>
        <small>Subjective visual harmony, not identity or worth.</small>
      </div>
      <div class="score-card">
        <span>Facial Rating</span>
        <strong>${result.facial_rating || "-"}</strong>
        <small>Aesthetic impression from this image only.</small>
      </div>
      <div class="score-card">
        <span>Image Ratio Score</span>
        <strong>${result.image_ratio_score || "-"}</strong>
        <small>Photo angle, facial thirds, symmetry, lighting.</small>
      </div>
    </div>
    <h3>Proportion Notes</h3>
    <ul>${renderList(proportions)}</ul>
    <h3>Visible Concerns</h3>
    <ul>${renderList(concerns)}</ul>
    <h3>Routine</h3>
    <div class="routine">
      ${
        routine
          .map(
            (item) => `
              <div>
                <span>${item.step || "Step"}</span>
                <p>${item.recommendation || "-"}</p>
              </div>
            `
          )
          .join("") || "<p>-</p>"
      }
    </div>
    <p class="notes">${result.notes || ""}</p>
  `;
}

adminToggle.addEventListener("click", () => {
  adminPanel.hidden = !adminPanel.hidden;
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const response = await fetch("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: document.querySelector("#password").value }),
  });
  const data = await response.json();
  setMessage(adminMessage, data.message, !response.ok);
});

brandForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#brandInput");
  const response = await fetch("/admin/brands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brand: input.value }),
  });
  const data = await response.json();
  if (response.ok) {
    input.value = "";
    renderBrands(data.brands);
    setMessage(adminMessage, "Brand list updated");
  } else {
    setMessage(adminMessage, data.message, true);
  }
});

brandList.addEventListener("click", async (event) => {
  const button = event.target.closest(".chip");
  if (!button) return;
  const response = await fetch(`/admin/brands/${encodeURIComponent(button.dataset.brand)}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (response.ok) {
    renderBrands(data.brands);
    setMessage(adminMessage, "Brand removed");
  } else {
    setMessage(adminMessage, data.message, true);
  }
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.alt = file.name;
  preview.style.display = "block";
  setMessage(scanMessage, file.name);
});

scanForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = imageInput.files[0];
  if (!file) {
    setMessage(scanMessage, "Upload a face image first", true);
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  setMessage(scanMessage, "Analyzing image...");

  const response = await fetch("/analyze", { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    setMessage(scanMessage, data.message || "Analysis failed", true);
    return;
  }
  renderResult(data.result);
  setMessage(scanMessage, "Analysis complete");
});

function addChatBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) {
    setMessage(chatMessage, "Type a message first", true);
    return;
  }

  addChatBubble("user", message);
  chatInput.value = "";
  setMessage(chatMessage, "Assistant is thinking...");

  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    setMessage(chatMessage, data.message || "Chat failed", true);
    return;
  }
  addChatBubble("assistant", data.reply);
  setMessage(chatMessage, "");
});
let currentSessionId = null;   // keep it in memory while the page lives

async function sendMessage() {
    const userText = document.getElementById("msgInput").value;
    const payload = {
        message: userText,
        session_id: currentSessionId   // may be null → server creates a new one
    };

    const resp = await fetch("/assistant", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    const data = await resp.json();
    currentSessionId = data.session_id;   // store for next round

    // …append userText & data.reply to the chat UI…
}
