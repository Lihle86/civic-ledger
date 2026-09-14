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
  const estimatedTotal = $("estimatedTotal");
  const actualPayResult = $("actualPayResult");
  const savedMessage = $("savedMessage");

  const siteReportResult = $("siteReportResult");

  const rates = {
    area12: {
      A: 7350,
      B: 7165,
      C: 7003,
      D: 6840,
      E: 6660
    },
    area3: {
      A: 6860,
      B: 6680,
      C: 6500,
      D: 6320,
      E: 6150
    }
  };

  const NIGHT_ALLOWANCE_PER_SHIFT = 8;
  const SPECIAL_ALLOWANCE_PER_SHIFT = 10.5;
  const CLEANING_ALLOWANCE = 32;

  let latestAudit = null;
  let latestCase = null;

  function money(value) {
    return "R " + Number(value || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function numberValue(input) {
    return Number(input?.value) || 0;
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

    return Array.from(values, (value) => {
      return alphabet[value % alphabet.length];
    }).join("");
  }

  function createCaseNumber() {
    const year = new Date().getFullYear();
    return `CL-${year}-${secureCode(6)}`;
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
    const baseWage = rates[area.value][grade.value];

    const nightTotal =
      numberValue(nightShifts) * NIGHT_ALLOWANCE_PER_SHIFT;

    const specialTotal =
      numberValue(specialShifts) * SPECIAL_ALLOWANCE_PER_SHIFT;

    const cleaningTotal = cleaningAllowance.checked
      ? CLEANING_ALLOWANCE
      : 0;

    const referenceTotal =
      baseWage + nightTotal + specialTotal + cleaningTotal;

    const receivedPay = numberValue(actualPay);
    const shortfall = Math.max(referenceTotal - receivedPay, 0);

    return {
      baseWage,
      nightTotal,
      specialTotal,
      cleaningTotal,
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
    estimatedTotal.textContent = money(values.referenceTotal);
    actualPayResult.textContent = money(values.receivedPay);
    difference.textContent = money(values.shortfall);

    resultStatus.textContent =
      values.shortfall > 0
        ? "Preliminary estimate"
        : "No difference";

    let message = values.shortfall > 0
      ? "This is a preliminary possible difference. Keep payslips, rosters and payment records for verification."
      : "No difference was identified using the information entered. Keep your records for verification.";

    if (values.sundayHours > 0 || values.holidayHours > 0) {
      message += " Sunday or public-holiday hours were entered but are not included in this preliminary calculation.";
    }

    resultMessage.textContent = message;

    const premiumWarning = $("premiumWarning");

    if (premiumWarning) {
      if (values.sundayHours > 0 || values.holidayHours > 0) {
        premiumWarning.textContent =
          "Review required: Sunday/public-holiday hours may change the final amount. The applicable agreement, roster and shift pattern must be checked.";
        premiumWarning.classList.remove("hidden");
      } else {
        premiumWarning.textContent = "";
        premiumWarning.classList.add("hidden");
      }
    }

    if ($("sundayHoursResult")) {
      $("sundayHoursResult").textContent = values.sundayHours;
    }

    if ($("holidayHoursResult")) {
      $("holidayHoursResult").textContent = values.holidayHours;
    }

    latestAudit = {
      ...values,
      workerName: workerName.value.trim(),
      area: area.value,
      grade: grade.value,
      auditMonth: auditMonth.value,
      ordinaryShifts: numberValue(ordinaryShifts),
      nightShifts: numberValue(nightShifts),
      specialShifts: numberValue(specialShifts),
      cleaningAllowance: cleaningAllowance.checked,
      feedbackConsent: feedbackConsent.checked,
      createdAt: new Date().toISOString()
    };

    resultCard.classList.remove("hidden");
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

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function exportAudit() {
    const record = getAuditRecord();

    const report = [
      "CIVIC LEDGER PRELIMINARY WAGE AUDIT",
      "",
      `Audit month: ${record.auditMonth || "Not entered"}`,
      `Wage area: ${record.area}`,
      `Security grade: ${record.grade}`,
      `Ordinary shifts: ${record.ordinaryShifts}`,
      `Sunday hours requiring review: ${record.sundayHours}`,
      `Public-holiday hours requiring review: ${record.holidayHours}`,
      `Night shifts: ${record.nightShifts}`,
      `Qualifying allowance shifts: ${record.specialShifts}`,
      `Actual pay: ${money(record.receivedPay)}`,
      `Estimated reference total: ${money(record.referenceTotal)}`,
      `Preliminary possible difference: ${money(record.shortfall)}`,
      "",
      "This is an independent estimate, not an official determination.",
      "Verify against payslips, contracts, rosters, the applicable agreement and payroll records."
    ].join("
");

    downloadText(
      report,
      `civic-ledger-wage-audit-${record.auditMonth || "report"}.txt`
    );
  }

  function createSiteReport() {
    const siteName = $("siteName").value.trim();
    const siteAddress = $("siteAddress").value.trim();
    const securityCompany = $("securityCompany").value.trim();
    const guardsAffected = Number($("guardsAffected").value) || 0;
    const expectedPay = Number($("expectedPay").value) || 0;
    const actualSitePay = Number($("actualSitePay").value) || 0;
    const siteConcern = $("siteConcern").value.trim();

    const reporterMode =
      $("reporterMode")?.value || "anonymous";

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
      siteReportResult.textContent =
        "Complete the worksite, address, company, affected-guard number, concern and confirmation fields.";

      siteReportResult.classList.remove("hidden");
      return;
    }

    const audit = latestAudit || calculateValues();
    const caseNumber = createCaseNumber();
    const accessCode = secureCode(10);
    const now = new Date().toISOString();

    const estimatedShortfall =
      Math.max(expectedPay - actualSitePay, 0) * guardsAffected;

    latestCase = {
      caseNumber,
      accessCode,
      createdAt: now,
      status: "Submitted",
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
  }

  function showCaseResult(caseData) {
    siteReportResult.innerHTML = `
      <div class="case-result">
        <div class="case-number">
          Case number: ${escapeHtml(caseData.caseNumber)}
        </div>

        <p>
          <strong>Private access code:</strong>
          <span class="access-code">
            ${escapeHtml(caseData.accessCode)}
          </span>
        </p>

        <p>
          <strong>Status:</strong>
          Submitted
        </p>

        <p>
          Saved locally on this device. It has not been sent to inspectors.
        </p>
      </div>
    `;

    siteReportResult.classList.remove("hidden");

    const printButton = $("printCaseButton");

    if (printButton) {
      printButton.classList.remove("hidden");
    }

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
        <span class="print-label">Case number</span>
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
        <span class="print-label">Submitted</span>
        <span>${escapeHtml(new Date(caseData.createdAt).toLocaleString("en-ZA"))}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Reporting preference</span>
        <span>${escapeHtml(caseData.reporterMode)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Preferred language</span>
        <span>${escapeHtml(caseData.reporterLanguage)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Site</span>
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
        <span>${caseData.guardsAffected}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Complaint</span>
        <span>${escapeHtml(caseData.siteConcern)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Preliminary wage difference</span>
        <span>${money(audit.shortfall || 0)}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Sunday hours requiring review</span>
        <span>${audit.sundayHours || 0}</span>
      </div>

      <div class="print-row">
        <span class="print-label">Public-holiday hours requiring review</span>
        <span>${audit.holidayHours || 0}</span>
      </div>

      <h3>Evidence available</h3>
      <p>${escapeHtml(caseData.documentsAvailable || "Not specified")}</p>

      <h3>Evidence missing</h3>
      <p>${escapeHtml(caseData.documentsMissing || "Not specified")}</p>

      <h3>Reporter statement</h3>
      <p>${escapeHtml(caseData.reporterStatement || "Not provided")}</p>

      <p class="help-text">
        This document records information supplied by the reporter.
        It is not an official finding. Verification requires payroll,
        roster, contract and payment records.
      </p>

      <h3>Official follow-up</h3>
      <p>Department reference: ______________________________</p>
      <p>Official name and signature: _________________________</p>
      <p>Date and stamp: _____________________________________</p>
    `;

    casePack.classList.remove("hidden");
  }

  function checkStatus() {
    const caseNumber = $("statusCaseNumber")?.value.trim();
    const accessCode = $("statusAccessCode")?.value.trim();
    const statusResult = $("statusResult");

    if (!caseNumber || !accessCode) {
      statusResult.textContent =
        "Enter both the case number and private access code.";

      statusResult.classList.remove("hidden");
      return;
    }

    const stored = localStorage.getItem(
      `civicLedgerCase:${caseNumber}`
    );

    if (!stored) {
      statusResult.textContent =
        "No case was found on this device.";

      statusResult.classList.remove("hidden");
      return;
    }

    let caseData;

    try {
      caseData = JSON.parse(stored);
    } catch (error) {
      statusResult.textContent =
        "This case record could not be read.";

      statusResult.classList.remove("hidden");
      return;
    }

    if (caseData.accessCode !== accessCode) {
      statusResult.textContent =
        "The case number or private access code is incorrect.";

      statusResult.classList.remove("hidden");
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
          No departmental action can be confirmed by this local prototype.
        </p>
      </div>
    `;

    statusResult.classList.remove("hidden");
  }

  function printCasePack() {
    const casePack = $("casePack");

    if (
      !casePack ||
      casePack.classList.contains("hidden")
    ) {
      return;
    }

    window.print();
  }

  function clearAudit() {
    window.location.reload();
  }

  $("auditButton")?.addEventListener(
    "click",
    calculateAudit
  );

  $("clearButton")?.addEventListener(
    "click",
    clearAudit
  );

  $("saveButton")?.addEventListener(
    "click",
    saveAudit
  );

  $("exportButton")?.addEventListener(
    "click",
    exportAudit
  );

  $("siteReportButton")?.addEventListener(
    "click",
    createSiteReport
  );

  $("statusButton")?.addEventListener(
    "click",
    checkStatus
  );

  $("printCaseButton")?.addEventListener(
    "click",
    printCasePack
  );

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