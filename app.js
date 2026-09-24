document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const workerName = $("workerName");
  const area = $("area");
  const grade = $("grade");
  const auditMonth = $("auditMonth");
  const ordinaryShifts = $("ordinaryShifts");
  const sundayHours = $("sundayHours");
  const holidayHours = $("holidayHours");
  const nightShifts = $("nightShifts");
  const specialShifts = $("specialShifts");
  const cleaningAllowance = $("cleaningAllowance");
  const transferAllowance = $("transferAllowance");
  const actualPay = $("actualPay");
  const feedbackConsent = $("feedbackConsent");

  const resultCard = $("resultCard");
  const resultStatus = $("resultStatus");
  const difference = $("difference");
  const resultMessage = $("resultMessage");
  const minimumWage = $("minimumWage");
  const nightAmount = $("nightAmount");
  const specialAmount = $("specialAmount");
  const cleaningAmount = $("cleaningAmount");
  const transferAmount = $("transferAmount");
  const estimatedTotal = $("estimatedTotal");
  const actualPayResult = $("actualPayResult");
  const savedMessage = $("savedMessage");
  const siteReportResult = $("siteReportResult");

  const notificationPanel = $("notificationPanel");
  const notificationMessage = $("notificationMessage");
  const closeNotificationButton = $("closeNotificationButton");

  const rates = {
    area12: {
      A: 8184,
      B: 7607,
      C: 7003,
      D: 7003,
      E: 7003
    },
    area3: {
      A: 7142,
      B: 6726,
      C: 6726,
      D: 6726,
      E: 6726
    }
  };

  const NIGHT_ALLOWANCE_PER_SHIFT = 8;
  const SPECIAL_ALLOWANCE_PER_SHIFT = 10.5;
  const CLEANING_ALLOWANCE = 32;
  const TRANSFER_ALLOWANCE = 100;

  let latestAudit = null;
  let latestCase = null;

  function money(value) {
    return "R " + Number(value || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function numberValue(input) {
    const value = Number(input?.value);

    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return value;
  }

  function setDefaultAuditMonth() {
    if (auditMonth && !auditMonth.value) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");

      auditMonth.value = `${year}-${month}`;
    }
  }

  function showNotification(message, type = "info") {
    if (!notificationPanel || !notificationMessage) {
      return;
    }

    notificationPanel.className = "notification-panel";
    notificationPanel.classList.add(type);
    notificationMessage.textContent = message;
    notificationPanel.classList.remove("hidden");
  }

  function hideNotification() {
    notificationPanel?.classList.add("hidden");
  }

  function secureCode(length = 8) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const values = new Uint32Array(length);

    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let i = 0; i < length; i += 1) {
        values[i] = Math.floor(Math.random() * 4294967295);
      }
    }

    return Array.from(
      values,
      (value) => alphabet[value % alphabet.length]
    ).join("");
  }

  function createCaseNumber() {
    return `CL-${new Date().getFullYear()}-${secureCode(6)}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function calculateValues() {
    const selectedArea = area?.value || "area12";
    const selectedGrade = grade?.value || "C";

    const baseWage =
      rates[selectedArea]?.[selectedGrade] || 0;

    const nightTotal =
      numberValue(nightShifts) * NIGHT_ALLOWANCE_PER_SHIFT;

    const specialTotal =
      numberValue(specialShifts) * SPECIAL_ALLOWANCE_PER_SHIFT;

    const cleaningTotal = cleaningAllowance?.checked
      ? CLEANING_ALLOWANCE
      : 0;

    const transferTotal = transferAllowance?.checked
      ? TRANSFER_ALLOWANCE
      : 0;

    const referenceTotal =
      baseWage +
      nightTotal +
      specialTotal +
      cleaningTotal +
      transferTotal;

    const receivedPay = numberValue(actualPay);
    const shortfall = Math.max(referenceTotal - receivedPay, 0);

    return {
      baseWage,
      nightTotal,
      specialTotal,
      cleaningTotal,
      transferTotal,
      referenceTotal,
      receivedPay,
      shortfall,
      sundayHours: numberValue(sundayHours),
      holidayHours: numberValue(holidayHours)
    };
  }

  function calculateAudit() {
    const values = calculateValues();

    minimumWage.textContent = money(values.baseWage);
    nightAmount.textContent = money(values.nightTotal);
    specialAmount.textContent = money(values.specialTotal);
    cleaningAmount.textContent = money(values.cleaningTotal);
    transferAmount.textContent = money(values.transferTotal);
    estimatedTotal.textContent = money(values.referenceTotal);
    actualPayResult.textContent = money(values.receivedPay);
    difference.textContent = money(values.shortfall);

    resultStatus.textContent =
      values.shortfall > 0
        ? "Preliminary estimate"
        : "No difference found";

    let message = values.shortfall > 0
      ? "This is a preliminary possible difference. Keep payslips, rosters and payment records for verification."
      : "No difference was identified using the information entered. Keep your records for verification.";

    if (numberValue(ordinaryShifts) !== 16) {
      message += " The ordinary-shift figure differs from the 16-shift example, so the result needs verification against the roster and agreement.";
    }

    if (values.sundayHours > 0 || values.holidayHours > 0) {
      message += " Sunday or public-holiday hours were entered but are not included in this preliminary calculation.";
    }

    resultMessage.textContent = message;

    const premiumWarning = $("premiumWarning");

    if (premiumWarning) {
      if (values.sundayHours > 0 || values.holidayHours > 0) {
        premiumWarning.textContent =
          "Review required: Sunday or public-holiday hours may change the final amount. Check the applicable agreement, roster and shift pattern.";

        premiumWarning.classList.remove("hidden");
      } else {
        premiumWarning.textContent = "";
        premiumWarning.classList.add("hidden");
      }
    }

    $("sundayHoursResult").textContent = values.sundayHours;
    $("holidayHoursResult").textContent = values.holidayHours;

    latestAudit = {
      ...values,
      workerName: workerName?.value.trim() || "",
      area: area?.value || "area12",
      grade: grade?.value || "C",
      auditMonth: auditMonth?.value || "",
      ordinaryShifts: numberValue(ordinaryShifts),
      nightShifts: numberValue(nightShifts),
      specialShifts: numberValue(specialShifts),
      cleaningAllowance: cleaningAllowance?.checked || false,
      transferAllowance: transferAllowance?.checked || false,
      feedbackConsent: feedbackConsent?.checked || false,
      createdAt: new Date().toISOString()
    };

    resultCard.classList.remove("hidden");

    showNotification(
      values.shortfall > 0
        ? "A possible wage difference was identified. Keep all records for verification."
        : "Your preliminary wage audit is ready.",
      values.shortfall > 0 ? "warning" : "success"
    );
  }

  function getAuditRecord() {
    if (!latestAudit) {
      calculateAudit();
    }

    return latestAudit;
  }

  function saveAudit() {
    const record = getAuditRecord();

    localStorage.setItem(
      "civicLedgerLastAudit",
      JSON.stringify(record)
    );

    savedMessage.textContent =
      "Audit saved locally on this device.";

    savedMessage.classList.remove("hidden");

    showNotification(
      "Your wage audit was saved locally on this device.",
      "success"
    );
  }

  function downloadText(text, filename) {
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportAudit() {
    const record = getAuditRecord();

    const report = [
      "CIVIC LEDGER PRELIMINARY WAGE AUDIT",
      "",
      `Audit month: ${record.auditMonth || "Not entered"}`,
      `Worker reference: ${record.workerName || "Not entered"}`,
      `Wage area: ${record.area}`,
      `Security grade: ${record.grade}`,
      `Ordinary shifts entered: ${record.ordinaryShifts}`,
      `Sunday hours requiring review: ${record.sundayHours}`,
      `Public-holiday hours requiring review: ${record.holidayHours}`,
      `Night shifts: ${record.nightShifts}`,
      `Qualifying allowance shifts: ${record.specialShifts}`,
      `Cleaning allowance included: ${record.cleaningAllowance ? "Yes" : "No"}`,
      `Transfer allowance included: ${record.transferAllowance ? "Yes" : "No"}`,
      "",
      `Reference minimum wage: ${money(record.baseWage)}`,
      `Night allowance: ${money(record.nightTotal)}`,
      `Qualifying-duty allowance: ${money(record.specialTotal)}`,
      `Cleaning allowance: ${money(record.cleaningTotal)}`,
      `Transfer allowance: ${money(record.transferTotal)}`,
      `Actual pay entered: ${money(record.receivedPay)}`,
      `Estimated reference total: ${money(record.referenceTotal)}`,
      `Preliminary possible difference: ${money(record.shortfall)}`,
      "",
      "This is an independent estimate, not an official determination.",
      "Verify against payslips, contract, rosters, the applicable agreement and payroll records.",
      "Sunday and public-holiday hours require separate verification."
    ].join("
");

    downloadText(
      report,
      `civic-ledger-wage-audit-${record.auditMonth || "report"}.txt`
    );

    showNotification(
      "Your wage-audit report was exported as a text file.",
      "success"
    );
  }

  function createSiteReport() {
    const siteName = $("siteName")?.value.trim() || "";
    const siteAddress = $("siteAddress")?.value.trim() || "";
    const securityCompany =
      $("securityCompany")?.value.trim() || "";

    const guardsAffected =
      Number($("guardsAffected")?.value) || 0;

    const expectedPay =
      Number($("expectedPay")?.value) || 0;

    const actualSitePay =
      Number($("actualSitePay")?.value) || 0;

    const siteConcern = $("siteConcern")?.value.trim() || "";

    const reporterMode =
      $("reporterMode")?.value || "no-name-entered";

    const reporterLanguage =
      $("reporterLanguage")?.value || "English";

    const documentsAvailable =
      $("documentsAvailable")?.value.trim() || "";

    const documentsMissing =
      $("documentsMissing")?.value.trim() || "";

    const reporterStatement =
      $("reporterStatement")?.value.trim() || "";

    const confirmInformation =
      $("confirmInformation")?.checked || false;

    if (
      !siteName ||
      !siteAddress ||
      !securityCompany ||
      guardsAffected < 1 ||
      !siteConcern ||
      !confirmInformation
    ) {
      const message =
        "Complete the worksite, address, company, affected-guard number, concern and confirmation fields.";

      siteReportResult.textContent = message;
      siteReportResult.classList.remove("hidden");
      showNotification(message, "warning");
      return;
    }

    calculateAudit();

    const audit = latestAudit;
    const caseNumber = createCaseNumber();
    const accessCode = secureCode(10);
    const now = new Date().toISOString();

    const estimatedShortfall =
      Math.max(expectedPay - actualSitePay, 0) *
      guardsAffected;

    latestCase = {
      caseNumber,
      accessCode,
      createdAt: now,
      status: "Saved locally",
      lastUpdated: now,
      siteName,
      siteAddress,
      securityCompany,
      guardsAffected,
      expectedPay,
      actualSitePay,
      estimatedShortfall,
      siteConcern,
      reporterMode,
      reporterLanguage,
      documentsAvailable,
      documentsMissing,
      reporterStatement,
      audit
    };

    localStorage.setItem(
      `civicLedgerCase:${caseNumber}`,
      JSON.stringify(latestCase)
    );

    localStorage.setItem(
      "civicLedgerLastCase",
      JSON.stringify(latestCase)
    );

    showCaseResult(latestCase);

    showNotification(
      "Your local record and evidence pack were created on this device.",
      "success"
    );
  }

  function showCaseResult(caseData) {
    siteReportResult.innerHTML = `
      <div class="case-result">
        <div class="case-number">
          Local case number: ${escapeHtml(caseData.caseNumber)}
        </div>

        <p>
          <strong>Private access code:</strong>
          <span class="access-code">
            ${escapeHtml(caseData.accessCode)}
          </span>
        </p>

        <p>
          <strong>Status:</strong>
          Saved locally on this device
        </p>

        <p>
          This record has not been sent to inspectors, government departments, employers, unions or any other organisation.
        </p>
      </div>
    `;

    siteReportResult.classList.remove("hidden");
    $("printCaseButton").classList.remove("hidden");

    buildCasePack(caseData);
  }

  function buildCasePack(caseData) {
    const casePack = $("casePack");
    const casePackContent = $("casePackContent");

    if (!casePack || !casePackContent) {
      return;
    }

    const audit = caseData.audit || {};

    casePackContent.innerHTML = `
      <div class="print-row">
        <span class="print-label">Local case number</span>
        <span>${escapeHtml(caseData.caseNumber)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Private access code</span>
        <span>${escapeHtml(caseData.accessCode)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Status</span>
        <span>${escapeHtml(caseData.status)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Created</span>
        <span>${escapeHtml(new Date(caseData.createdAt).toLocaleString("en-ZA"))}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Worksite</span>
        <span>${escapeHtml(caseData.siteName)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Address</span>
        <span>${escapeHtml(caseData.siteAddress)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Security company</span>
        <span>${escapeHtml(caseData.securityCompany)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Guards affected</span>
        <span>${escapeHtml(caseData.guardsAffected)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Expected monthly pay per guard</span>
        <span>${money(caseData.expectedPay)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Actual monthly pay per guard</span>
        <span>${money(caseData.actualSitePay)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Estimated site difference</span>
        <span>${money(caseData.estimatedShortfall)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Concern</span>
        <span>${escapeHtml(caseData.siteConcern)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Individual preliminary wage difference</span>
        <span>${money(audit.shortfall || 0)}</span>
      </div>

      <h3>Evidence available</h3>
      <p>${escapeHtml(caseData.documentsAvailable || "Not specified")}</p>

      <h3>Evidence missing</h3>
      <p>${escapeHtml(caseData.documentsMissing || "Not specified")}</p>

      <h3>Reporter statement</h3>
      <p>${escapeHtml(caseData.reporterStatement || "Not provided")}</p>

      <p class="help-text">
        This document records information supplied by the user. It is
        not an official finding, submission or determination.
      </p>
    `;

    casePack.classList.remove("hidden");
  }

  function checkStatus() {
    const caseNumber =
      $("statusCaseNumber")?.value.trim() || "";

    const accessCode =
      $("statusAccessCode")?.value.trim() || "";

    const statusResult = $("statusResult");

    if (!caseNumber || !accessCode) {
      const message =
        "Enter both the local case number and private access code.";

      statusResult.textContent = message;
      statusResult.classList.remove("hidden");
      showNotification(message, "warning");
      return;
    }

    const stored = localStorage.getItem(
      `civicLedgerCase:${caseNumber}`
    );

    if (!stored) {
      const message =
        "No local case record was found on this device and browser.";

      statusResult.textContent = message;
      statusResult.classList.remove("hidden");
      showNotification(message, "warning");
      return;
    }

    let caseData;

    try {
      caseData = JSON.parse(stored);
    } catch {
      const message =
        "This local case record could not be read.";

      statusResult.textContent = message;
      statusResult.classList.remove("hidden");
      showNotification(message, "warning");
      return;
    }

    if (caseData.accessCode !== accessCode) {
      const message =
        "The local case number or private access code is incorrect.";

      statusResult.textContent = message;
      statusResult.classList.remove("hidden");
      showNotification(message, "warning");
      return;
    }

    statusResult.innerHTML = `
      <div class="case-result">
        <strong>${escapeHtml(caseData.caseNumber)}</strong>

        <p>
          Status: ${escapeHtml(caseData.status)}
        </p>

        <p>
          Last updated:
          ${escapeHtml(new Date(caseData.lastUpdated).toLocaleString("en-ZA"))}
        </p>

        <p>
          This prototype cannot confirm departmental action because no report has been sent from the app.
        </p>
      </div>
    `;

    statusResult.classList.remove("hidden");

    showNotification(
      "Local case record found on this device.",
      "success"
    );
  }

  function printCasePack() {
    const casePack = $("casePack");

    if (!casePack || casePack.classList.contains("hidden")) {
      showNotification(
        "Create a local record before printing an evidence pack.",
        "warning"
      );

      return;
    }

    window.print();
  }

  function clearAudit() {
    window.location.reload();
  }

  $("auditButton")?.addEventListener("click", calculateAudit);
  $("clearButton")?.addEventListener("click", clearAudit);
  $("saveButton")?.addEventListener("click", saveAudit);
  $("exportButton")?.addEventListener("click", exportAudit);
  $("siteReportButton")?.addEventListener("click", createSiteReport);
  $("statusButton")?.addEventListener("click", checkStatus);
  $("printCaseButton")?.addEventListener("click", printCasePack);
  closeNotificationButton?.addEventListener("click", hideNotification);

  setDefaultAuditMonth();

  if (!navigator.onLine) {
    showNotification(
      "You are offline. Civic Ledger can still save local records on this device.",
      "info"
    );
  }

  window.addEventListener("offline", () => {
    showNotification(
      "You are offline. Records remain available only on this device.",
      "warning"
    );
  });

  window.addEventListener("online", () => {
    showNotification(
      "Internet connection restored.",
      "success"
    );
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js")
        .catch((error) => {
          console.error(
            "Service worker registration failed:",
            error
          );
        });
    });
  }
});
