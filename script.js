const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".nav a");
const routedControls = document.querySelectorAll("[data-screen], [data-route]");
const screens = document.querySelectorAll(".app-screen");
const steps = document.querySelectorAll(".step");
const panels = document.querySelectorAll(".wizard-panel");
const prevStep = document.querySelector("#prevStep");
const nextStep = document.querySelector("#nextStep");
const homeServiceRoutes = ["lookup", "services", "support", "payment"];

let currentStep = 0;

const screenToRoute = {
  home: "/",
  services: "/services",
  info: "/info",
  lookup: "/lookup",
  payment: "/payment",
  support: "/support",
  profile: "/profile",
  wizard: "/wizard",
  change: "/change",
  delete: "/delete",
  assetNotice: "/asset-notice",
  login: "/login",
  register: "/register",
  "register-individual": "/register/individual",
  "register-organization": "/register/organization",
  "ho-so-cua-toi": "/ho-so-cua-toi",
  "state-compensation": "/state-compensation",
  "state-create": "/state-compensation/create",
  "state-my-records": "/state-compensation/my-records",
  "state-search": "/state-compensation/search",
  "state-consultation": "/state-compensation/online-consultation",
};

const routeToScreen = Object.fromEntries(
  Object.entries(screenToRoute).map(([screen, route]) => [route, screen])
);

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
});

function normalizePath(path) {
  if (!path) return "/";
  let normalized = path.toLowerCase();
  if (normalized.endsWith("/") && normalized !== "/") {
    normalized = normalized.slice(0, -1);
  }
  return normalized || "/";
}

let currentStateDetailId = null;

function getScreenFromPath(path) {
  const normalized = normalizePath(path);

  // dynamic detail route: /state-compensation/detail/:id
  if (normalized.startsWith("/state-compensation/detail")) {
    const parts = normalized.split("/").filter(Boolean);
    // parts = ["state-compensation", "detail", ":id"]
    currentStateDetailId = parts[2] || null;
    return "state-detail";
  }

  currentStateDetailId = null;
  return routeToScreen[normalized] || "home";
}

function getRouteForScreen(screen) {
  return screenToRoute[screen] || null;
}

function showScreen(screenName) {
  if (screenName === "home") {
    document.body.classList.remove("app-mode");
    screens.forEach((screen) => screen.classList.remove("is-active"));
  } else {
    document.body.classList.add("app-mode");
    screens.forEach((screen) => {
      screen.classList.toggle("is-active", screen.dataset.page === screenName);
    });
  }

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.screen === screenName);
  });

  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.screen === screenName);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  // render module-specific UI when shown
  if (screenName === 'state-create') renderStateCreateSteps();
  if (screenName === 'state-my-records') renderStateMyRecords();
  if (screenName === 'state-detail') renderStateDetail();
  if (screenName === 'state-search') renderStateSearch();
  if (screenName === 'state-consultation') renderStateConsultation();
  if (screenName === 'profile') setupProfilePage();
}

function navigateTo(path, replace = false) {
  const normalizedPath = normalizePath(path);
  const screenName = getScreenFromPath(normalizedPath);
  if (replace) {
    history.replaceState({ path: normalizedPath }, "", normalizedPath);
  } else {
    history.pushState({ path: normalizedPath }, "", normalizedPath);
  }
  showScreen(screenName);
}

function handleRouteClick(event, control) {
  event.preventDefault();
  if (control.dataset.route) {
    navigateTo(control.dataset.route);
    return;
  }

  if (control.dataset.screen) {
    const screenRoute = getRouteForScreen(control.dataset.screen);
    if (screenRoute) {
      navigateTo(screenRoute);
      return;
    }
    showScreen(control.dataset.screen);
  }
}

routedControls.forEach((control) => {
  control.addEventListener("click", (event) => handleRouteClick(event, control));
});

document.querySelectorAll(".service-card .service-button").forEach((button, index) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showScreen(homeServiceRoutes[index] || "services");
  });
});

function setStep(index) {
  currentStep = Math.max(0, Math.min(index, panels.length - 1));
  steps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === currentStep);
  });
  panels.forEach((panel, panelIndex) => {
    panel.classList.toggle("is-active", panelIndex === currentStep);
  });
}

// ----------------------
// State compensation module
// ----------------------

const stateMock = [
  { id: "SC-20260610-001", code: "SC-20260610-001", date: "10/06/2026", status: "processing", agency: "Sở Tư pháp Hà Nội", claimant: "Nguyễn Văn A", cccd: "012345678901" },
  { id: "SC-20260608-002", code: "SC-20260608-002", date: "08/06/2026", status: "supplement", agency: "Sở Tư pháp Đà Nẵng", claimant: "Trần Thị B", cccd: "098765432109" },
  { id: "SC-20260525-003", code: "SC-20260525-003", date: "25/05/2026", status: "completed", agency: "Sở Tư pháp TP.HCM", claimant: "Lê Văn C", cccd: "031234567890" },
];

function renderStateCreateSteps() {
  const container = document.querySelector('.app-screen[data-page="state-create"]');
  if (!container) return;

  container.innerHTML = `
    <div class="container">
      <div class="screen-title"><p class="section-kicker">Nộp hồ sơ</p><h2>Nộp hồ sơ yêu cầu bồi thường</h2></div>
      <div class="wizard-card">
        <div class="stepper">
          <div class="step is-active" data-step="0">1. Thông tin người yêu cầu</div>
          <div class="step" data-step="1">2. Thông tin vụ việc</div>
          <div class="step" data-step="2">3. Thông tin yêu cầu bồi thường</div>
          <div class="step" data-step="3">4. Tài liệu đính kèm</div>
          <div class="step" data-step="4">5. Xác nhận & nộp</div>
        </div>
        <div class="wizard-panel is-active">
          <h3>Bước 1 — Thông tin người yêu cầu</h3>
          <div class="form-grid">
            <label>Họ tên<input></label>
            <label>CCCD<input></label>
            <label>Ngày sinh<input type="date"></label>
            <label>Số điện thoại<input></label>
            <label>Email<input></label>
            <label class="full">Địa chỉ<textarea></textarea></label>
          </div>
        </div>
        <div class="wizard-panel">
          <h3>Bước 2 — Thông tin vụ việc</h3>
          <div class="form-grid">
            <label>Cơ quan gây thiệt hại<input></label>
            <label>Địa điểm xảy ra vụ việc<input></label>
            <label>Thời gian xảy ra<input type="date"></label>
            <label class="full">Nội dung vụ việc<textarea></textarea></label>
          </div>
        </div>
        <div class="wizard-panel">
          <h3>Bước 3 — Thông tin yêu cầu bồi thường</h3>
          <div class="form-grid">
            <label>Loại thiệt hại<select><option>Tài sản</option><option>Sức khỏe</option></select></label>
            <label>Số tiền yêu cầu bồi thường<input></label>
            <label class="full">Nội dung yêu cầu<textarea></textarea></label>
          </div>
        </div>
        <div class="wizard-panel">
          <h3>Bước 4 — Tài liệu đính kèm</h3>
          <div class="form-grid">
            <label>Upload PDF<input type="file" accept="application/pdf"></label>
            <label>Upload Word<input type="file" accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
            <label>Upload hình ảnh<input type="file" accept="image/*"></label>
          </div>
        </div>
        <div class="wizard-panel">
          <h3>Bước 5 — Xác nhận và nộp hồ sơ</h3>
          <p>Kiểm tra lại toàn bộ thông tin trước khi nộp.</p>
          <div class="wizard-actions">
            <button class="subtle-btn" id="state-back">Quay lại</button>
            <button class="business-btn" id="state-submit">Nộp hồ sơ</button>
          </div>
        </div>
        <div class="wizard-actions" style="margin-top:18px;">
          <button id="state-prev" class="subtle-btn">Quay</button>
          <button id="state-next" class="business-btn">Tiếp theo</button>
        </div>
      </div>
    </div>
  `;

  // setup step logic
  const panels = container.querySelectorAll('.wizard-panel');
  const stepsEls = container.querySelectorAll('.step');
  let stepIndex = 0;
  function show(idx) {
    stepIndex = Math.max(0, Math.min(idx, panels.length - 1));
    panels.forEach((p, i) => p.classList.toggle('is-active', i === stepIndex));
    stepsEls.forEach((s, i) => s.classList.toggle('is-active', i === stepIndex));
  }
  container.querySelector('#state-next').addEventListener('click', () => show(stepIndex + 1));
  container.querySelector('#state-prev').addEventListener('click', () => show(stepIndex - 1));
  container.querySelector('#state-back').addEventListener('click', () => show(stepIndex - 1));
  container.querySelector('#state-submit').addEventListener('click', () => {
    alert('Mô phỏng: hồ sơ đã được nộp (mock).');
    navigateTo('/state-compensation/my-records');
  });
}

function renderStateMyRecords() {
  const container = document.querySelector('.app-screen[data-page="state-my-records"]');
  if (!container) return;

  container.innerHTML = `
    <div class="container">
      <div class="screen-title"><p class="section-kicker">Hồ sơ bồi thường</p><h2>Hồ sơ bồi thường của tôi</h2></div>
      <div class="page-toolbar" style="margin-bottom:16px;">
        <div class="tab-list">
          <button class="tab-button is-active" data-tab="all">Tất cả</button>
          <button class="tab-button" data-tab="processing">Đang xử lý</button>
          <button class="tab-button" data-tab="supplement">Yêu cầu bổ sung</button>
          <button class="tab-button" data-tab="completed">Đã giải quyết</button>
          <button class="tab-button" data-tab="rejected">Từ chối</button>
        </div>
      </div>
      <div class="records-panel">
        <table class="data-table spaced"><thead><tr><th>Mã hồ sơ</th><th>Ngày nộp</th><th>Trạng thái</th><th>Cơ quan xử lý</th><th>Thao tác</th></tr></thead>
        <tbody>
        ${stateMock.map(r => `
          <tr>
            <td>${r.code}</td>
            <td>${r.date}</td>
            <td>${createStatusChip(r.status)}</td>
            <td>${r.agency}</td>
            <td><button class="subtle-btn" data-id="${r.id}" data-action="view">Xem chi tiết</button></td>
          </tr>
        `).join('')}
        </tbody></table>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      navigateTo(`/state-compensation/detail/${id}`);
    });
  });
}

function renderStateDetail() {
  const container = document.querySelector('.app-screen[data-page="state-detail"]');
  if (!container) return;
  const record = stateMock.find(r => r.id === currentStateDetailId) || null;
  container.innerHTML = `
    <div class="container">
      <div class="screen-title"><p class="section-kicker">Chi tiết hồ sơ</p><h2>Chi tiết hồ sơ bồi thường</h2></div>
      <div class="wizard-card">
        ${record ? `
          <h3>Thông tin hồ sơ</h3>
          <p><strong>Mã:</strong> ${record.code}</p>
          <p><strong>Người yêu cầu:</strong> ${record.claimant} — ${record.cccd}</p>
          <p><strong>Ngày nộp:</strong> ${record.date}</p>
          <p><strong>Cơ quan xử lý:</strong> ${record.agency}</p>
          <h4>Nội dung yêu cầu</h4>
          <p>— Mô tả mock về nội dung yêu cầu bồi thường.</p>
          <h4>Tài liệu đính kèm</h4>
          <p>Không có tệp đính kèm (mock).</p>
          <div class="wizard-actions">
            ${record.status === 'supplement' ? '<button class="business-btn" id="state-supplement">Bổ sung hồ sơ</button>' : ''}
            <button class="subtle-btn" id="state-back-to-list">Quay lại</button>
          </div>
        ` : '<p>Không tìm thấy hồ sơ.</p>'}
      </div>
    </div>
  `;

  const back = container.querySelector('#state-back-to-list');
  if (back) back.addEventListener('click', () => navigateTo('/state-compensation/my-records'));
  const supp = container.querySelector('#state-supplement');
  if (supp) supp.addEventListener('click', () => alert('Mô phỏng: mở form bổ sung (mock).'));
}

function renderStateSearch() {
  const container = document.querySelector('.app-screen[data-page="state-search"]');
  if (!container) return;
  container.innerHTML = `
    <div class="container">
      <div class="screen-title"><p class="section-kicker">Tra cứu</p><h2>Tra cứu hồ sơ bồi thường</h2></div>
      <div class="form-card">
        <div class="form-grid">
          <label>Mã hồ sơ<input id="search-code"></label>
          <label>CCCD<input id="search-cccd"></label>
        </div>
        <div style="margin-top:12px;"><button class="business-btn" id="do-search">Tra cứu</button></div>
        <div id="search-result" style="margin-top:16px;"></div>
      </div>
    </div>
  `;

  container.querySelector('#do-search').addEventListener('click', () => {
    const code = container.querySelector('#search-code').value.trim();
    const cccd = container.querySelector('#search-cccd').value.trim();
    const found = stateMock.find(r => (code && r.code === code) || (cccd && r.cccd === cccd));
    const out = container.querySelector('#search-result');
    if (found) {
      out.innerHTML = `<p><strong>Mã:</strong> ${found.code} — ${createStatusChip(found.status)}</p><p><strong>Ngày tiếp nhận:</strong> ${found.date}</p><p><strong>Cơ quan xử lý:</strong> ${found.agency}</p><p><button class="subtle-btn" onclick="navigateTo('/state-compensation/detail/${found.id}')">Xem chi tiết</button></p>`;
    } else {
      out.innerHTML = '<p>Không tìm thấy hồ sơ.</p>';
    }
  });
}

// ----------------------
// Online Consultation 
// ----------------------

const consultationMock = [
  { id: 1, userQuestion: "Tôi muốn hỏi về điều kiện được bồi thường nhà nước?", userTime: "03/06/2026 14:30", staffAnswer: "Theo quy định của Luật Trách nhiệm bồi thường của Nhà nước, người bị thiệt hại thuộc phạm vi trách nhiệm bồi thường của Nhà nước có quyền yêu cầu bồi thường. Điều kiện bồi thường bao gồm: (1) Hành động bất pháp của cơ quan nhà nước; (2) Gây thiệt hại; (3) Liên hệ nhân quả giữa hành động và thiệt hại.", staffName: "Nguyễn Thị Hạnh", staffTime: "03/06/2026 15:45", rated: false },
  { id: 2, userQuestion: "Hồ sơ bồi thường cần những tài liệu nào?", userTime: "02/06/2026 10:15", staffAnswer: "Hồ sơ yêu cầu bồi thường nhà nước cần bao gồm: (1) Đơn yêu cầu bồi thường; (2) Chứng cứ chứng minh thiệt hại; (3) Giấy tờ chứng minh quyền yêu cầu; (4) Các tài liệu liên quan khác. Xin vui lòng tham khảo mẫu đơn trên website.", staffName: "Trần Văn Bình", staffTime: "02/06/2026 11:30", rated: true, rating: 5 },
];

let consultationConversations = [...consultationMock];

function renderStateConsultation() {
  const container = document.querySelector('.app-screen[data-page="state-consultation"]');
  if (!container) return;

  container.innerHTML = '<div class="container"><div class="screen-title"><p class="section-kicker">Hỗ trợ</p><h2>Hỏi đáp trực tuyến về Bồi thường nhà nước</h2><p>Người dân gửi câu hỏi và nhận phản hồi từ cán bộ phụ trách lĩnh vực bồi thường nhà nước.</p></div><div class="consultation-container"><div class="consultation-history" id="consultation-history"></div><div class="consultation-form"><h3>Đặt câu hỏi</h3><textarea id="consultation-question" placeholder="Nhập câu hỏi về lĩnh vực bồi thường nhà nước" maxlength="2000"></textarea><div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;"><small id="char-count" style="color: var(--text-secondary);">0 / 2000 ký tự</small><button class="business-btn" id="send-question">Gửi câu hỏi</button></div></div></div></div>';

  const textarea = container.querySelector('#consultation-question');
  const charCount = container.querySelector('#char-count');
  const sendBtn = container.querySelector('#send-question');
  const historyDiv = container.querySelector('#consultation-history');

  // Update character count
  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length + ' / 2000 ký tự';
  });

  // Render conversation history
  function renderHistory() {
    let html = '';
    consultationConversations.forEach(conv => {
      const ratingStars = [1,2,3,4,5].map(star => {
        const disabled = conv.rated ? 'disabled' : '';
        const color = conv.rated && conv.rating === star ? 'color: var(--primary-red);' : 'color: #ddd;';
        return '<button class="rating-star" data-rating="' + star + '" data-conv="' + conv.id + '" ' + disabled + ' style="' + color + ' font-size: 24px; border: none; background: none; cursor: pointer;">★</button>';
      }).join('');

      const feedbackDisabled = conv.rated ? 'disabled' : '';
      const feedbackOpacity = conv.rated ? 'opacity: 0.5;' : '';
      const msgRatingOpacity = conv.rated ? 'style="opacity:0.6;"' : '';
      const thankYou = conv.rated ? '<p style="margin-top: 8px; color: var(--success); font-weight: 700;">Cảm ơn bạn đã gửi đánh giá.</p>' : '';

      html += '<div class="consultation-message user-message"><div class="msg-header">Bạn</div><div class="msg-body">' + conv.userQuestion + '</div><div class="msg-time">' + conv.userTime + '</div></div>';
      html += '<div class="consultation-message staff-message"><div class="msg-header">' + conv.staffName + '</div><div class="msg-body">' + conv.staffAnswer + '</div><div class="msg-time">' + conv.staffTime + '</div>';
      html += '<div class="msg-rating" ' + msgRatingOpacity + '><div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);"><strong>Đánh giá câu trả lời</strong><div style="display: flex; gap: 8px; margin: 8px 0;">' + ratingStars + '</div>';
      html += '<textarea class="feedback-textarea" data-conv="' + conv.id + '" placeholder="Nhập nhận xét về chất lượng câu trả lời" ' + feedbackDisabled + ' style="margin: 8px 0; ' + feedbackOpacity + '"></textarea>';
      html += '<button class="business-btn feedback-btn" data-conv="' + conv.id + '" ' + feedbackDisabled + ' style="' + (conv.rated ? 'opacity: 0.5; cursor: not-allowed;' : '') + '" type="button">Gửi đánh giá</button>' + thankYou + '</div></div></div>';
    });
    historyDiv.innerHTML = html;

    // Bind rating and feedback events
    historyDiv.querySelectorAll('.rating-star:not([disabled])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        const convId = parseInt(e.target.dataset.conv);
        historyDiv.querySelectorAll('[data-conv="' + convId + '"].rating-star').forEach((b, i) => {
          b.style.color = i < rating ? 'var(--primary-red)' : '#ddd';
        });
      });
    });

    historyDiv.querySelectorAll('.feedback-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const convId = parseInt(e.target.dataset.conv);
        const conv = consultationConversations.find(c => c.id === convId);
        if (conv && !conv.rated) {
          conv.rated = true;
          renderHistory();
        }
      });
    });
  }

  renderHistory();

  // Send question
  sendBtn.addEventListener('click', () => {
    const q = textarea.value.trim();
    if (!q) {
      alert('Vui lòng nhập câu hỏi.');
      return;
    }
    const now = new Date().toLocaleString('vi-VN');
    consultationConversations.unshift({
      id: consultationConversations.length + 1,
      userQuestion: q,
      userTime: now,
      staffAnswer: 'Cảm ơn bạn đã gửi câu hỏi. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.',
      staffName: 'Cán bộ hỗ trợ',
      staffTime: new Date(Date.now() + 2000).toLocaleString('vi-VN'),
      rated: false
    });
    textarea.value = '';
    charCount.textContent = '0 / 2000 ký tự';
    renderHistory();
  });
}

function setupProfilePage() {
  const editBtn = document.querySelector('#editProfileBtn');
  const changeBtn = document.querySelector('#changePasswordBtn');
  const phoneInput = document.querySelector('#profile-phone');
  const emailInput = document.querySelector('#profile-email');
  const addressInput = document.querySelector('#profile-address');
  const passwordModal = document.querySelector('#passwordModal');
  const modalClose = passwordModal?.querySelector('.modal-close');
  const cancelPassword = passwordModal?.querySelector('#cancelPassword');
  const passwordForm = passwordModal?.querySelector('form');
  const errorText = passwordModal?.querySelector('.modal-error');

  function setEditable(isEditable) {
    [phoneInput, emailInput, addressInput].forEach((input) => {
      if (!input) return;
      input.readOnly = !isEditable;
      input.classList.toggle('readonly', !isEditable);
      if (isEditable) input.focus();
    });
  }

  function handleEditClick() {
    if (!editBtn || !phoneInput || !emailInput || !addressInput) return;
    const editing = editBtn.dataset.editing === 'true';
    if (!editing) {
      setEditable(true);
      editBtn.textContent = 'Lưu thay đổi';
      editBtn.dataset.editing = 'true';
      return;
    }

    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();
    if (!phone || !email || !address) {
      alert('Vui lòng điền đầy đủ số điện thoại, email và địa chỉ liên hệ.');
      return;
    }

    setEditable(false);
    editBtn.textContent = 'Cập nhật thông tin';
    editBtn.dataset.editing = 'false';
    alert('Thông tin liên hệ đã được cập nhật (mock).');
  }

  function openModal() {
    if (!passwordModal) return;
    passwordModal.classList.add('is-visible');
    passwordModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!passwordModal) return;
    passwordModal.classList.remove('is-visible');
    passwordModal.setAttribute('aria-hidden', 'true');
    passwordForm?.reset();
    if (errorText) errorText.textContent = '';
  }

  if (editBtn) {
    editBtn.dataset.editing = editBtn.dataset.editing || 'false';
    editBtn.onclick = handleEditClick;
  }
  if (changeBtn) changeBtn.onclick = openModal;
  if (modalClose) modalClose.onclick = closeModal;
  if (cancelPassword) cancelPassword.onclick = closeModal;
  if (passwordModal) passwordModal.onclick = (event) => {
    if (event.target === passwordModal) closeModal();
  };

  if (passwordForm) {
    passwordForm.onsubmit = (event) => {
      event.preventDefault();
      const currentPass = passwordForm.querySelector('#currentPassword')?.value.trim();
      const newPass = passwordForm.querySelector('#newPassword')?.value.trim();
      const confirmPass = passwordForm.querySelector('#confirmNewPassword')?.value.trim();
      if (!currentPass || !newPass || !confirmPass) {
        if (errorText) errorText.textContent = 'Vui lòng điền đầy đủ các trường.';
        return;
      }
      if (newPass.length < 8) {
        if (errorText) errorText.textContent = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
        return;
      }
      if (newPass !== confirmPass) {
        if (errorText) errorText.textContent = 'Mật khẩu xác nhận không trùng khớp.';
        return;
      }
      if (errorText) errorText.textContent = '';
      closeModal();
      alert('Mật khẩu đã được cập nhật (mock).');
    };
  }
}

function createStatusChip(status) {
  const mapping = {
    draft: "Nháp",
    submitted: "Đã nộp",
    processing: "Đang xử lý",
    supplement: "Yêu cầu bổ sung",
    waiting: "Chờ ký",
    completed: "Hoàn thành",
    rejected: "Từ chối",
  };
  const label = mapping[status] || "Khác";
  return `<span class="status-chip ${status}">${label}</span>`;
}


const mockRecords = [
  { code: "HS-20260602-00018", type: "Đăng ký biện pháp bảo đảm", date: "02/06/2026", status: "submitted", handler: "Nguyễn Văn An" },
  { code: "HS-20260602-00022", type: "Đăng ký thay đổi", date: "28/05/2026", status: "processing", handler: "Trần Thị Hồng" },
  { code: "HS-20260601-00091", type: "Xóa đăng ký", date: "01/06/2026", status: "supplement", handler: "Nguyễn Thị Hạnh" },
  { code: "HS-20260525-00003", type: "Đăng ký biện pháp bảo đảm", date: "25/05/2026", status: "completed", handler: "Phạm Văn Bình" },
  { code: "HS-20260520-00019", type: "Đăng ký thay đổi", date: "20/05/2026", status: "rejected", handler: "Lê Thu Nga" },
  { code: "HS-20260605-00030", type: "Cấp bản sao văn bản chứng nhận", date: "05/06/2026", status: "waiting", handler: "Bùi Thanh Tùng" },
  { code: "HS-20260607-00033", type: "Đăng ký biện pháp bảo đảm", date: "07/06/2026", status: "draft", handler: "Nguyễn Văn An" },
];

const mockNotifications = [
  { title: "Hồ sơ được tiếp nhận", description: "HS-20260602-00018 đã được tiếp nhận.", time: "1 giờ trước" },
  { title: "Yêu cầu bổ sung hồ sơ", description: "HS-20260601-00091 cần bổ sung tài liệu.", time: "2 giờ trước" },
  { title: "Hồ sơ đã hoàn thành", description: "HS-20260525-00003 đã hoàn thành và sẵn sàng tải kết quả.", time: "Hôm nay" },
];

let activeRecordTab = "all";

function getRecordFilter(record) {
  if (activeRecordTab === "all") {
    return true;
  }
  return record.status === activeRecordTab;
}

function renderMyRecords() {
  const tableBody = document.querySelector(".records-table-body");
  if (!tableBody) return;

  const rows = mockRecords
    .filter(getRecordFilter)
    .map((record) => {
      const actions = [
        `<button class="subtle-btn" type="button">Xem chi tiết</button>`,
        record.status === "supplement" ? `<button class="subtle-btn" type="button">Bổ sung hồ sơ</button>` : "",
        record.status === "completed" ? `<button class="business-btn" type="button">Tải kết quả</button>` : "",
      ].filter(Boolean).join(" ");

      return `
        <tr>
          <td>${record.code}</td>
          <td>${record.type}</td>
          <td>${record.date}</td>
          <td>${createStatusChip(record.status)}</td>
          <td>${record.handler}</td>
          <td>${actions}</td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows || `<tr><td colspan="6">Không có hồ sơ phù hợp.</td></tr>`;
}

function renderNotifications() {
  const list = document.querySelector(".notification-list");
  if (!list) return;

  list.innerHTML = mockNotifications
    .map(
      (item) => `
        <li>
          <strong>${item.title}</strong>
          <p>${item.description}</p>
          <small>${item.time}</small>
        </li>
      `
    )
    .join("");
}

function bindMyProfileEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeRecordTab = button.dataset.tab;
      document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      renderMyRecords();
    });
  });

  const loginScreenButton = document.querySelector('.app-screen[data-page="login"] .auth-actions .business-btn');
  if (loginScreenButton) {
    loginScreenButton.addEventListener("click", () => {
      navigateTo("/ho-so-cua-toi");
    });
  }
}

steps.forEach((step) => {
  step.addEventListener("click", () => {
    setStep(Number(step.dataset.step));
  });
});

prevStep?.addEventListener("click", () => setStep(currentStep - 1));
nextStep?.addEventListener("click", () => setStep(currentStep + 1));

window.addEventListener("popstate", () => {
  showScreen(getScreenFromPath(window.location.pathname));
  renderMyRecords();
  renderNotifications();
});

document.addEventListener("DOMContentLoaded", () => {
  const initialScreen = getScreenFromPath(window.location.pathname);
  showScreen(initialScreen);
  renderMyRecords();
  renderNotifications();
  bindMyProfileEvents();
  const targetPath = getRouteForScreen(initialScreen) || "/";
  if (window.location.pathname !== targetPath) {
    history.replaceState({ path: normalizePath(window.location.pathname) }, "", normalizePath(window.location.pathname));
  }
});
