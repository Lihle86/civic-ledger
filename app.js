document.addEventListener("DOMContentLoaded", function () {
  const workerName = document.getElementById("workerName");
  const area = document.getElementById("area");
  const grade = document.getElementById("grade");
  const auditMonth = document.getElementById("auditMonth");

  const ordinaryShifts = document.getElementById("ordinaryShifts");
  const sundayHours = document.getElementById("sundayHours");
  const holidayHours = document.getElementById("holidayHours");
  const nightShifts = document.getElementById("nightShifts");
  const specialShifts = document.getElementById("specialShifts");
  const cleaningAllowance = document.getElementById("cleaningAllowance");
  const actualPay = document.getElementById("actualPay");
  const feedbackConsent = document.getElementById("feedbackConsent");

  const auditButton = document.getElementById("auditButton");
  const clearButton = document.getElementById("clearButton");
  const saveButton = document.getElementById("saveButton");
  const exportButton = document.getElementById("exportButton");

  const resultCard = document.getElementById("resultCard");
  const resultStatus = document.getElementById("resultStatus");
  const difference = document.getElementById("difference");
  const resultMessage = document.getElementById("resultMessage");
  const minimumWage = document.getElementById("minimumWage");
  const nightAmount = document.getElementById("nightAmount");
  const specialAmount = document.getElementById("specialAmount");
  const cleaningAmount = document.getElementById("cleaningAmount");
  const estimatedTotal = document.getElementById("estimatedTotal");
  const actualPayResult = document.getElementById("actualPayResult");
  const savedMessage = document.getElementById("savedMessage");

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

  function money(value) {
    return "R " + Number(value).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function numberValue(input) {
    return Number(input.value) || 0;
  }

  function calculateAudit() {
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

    minimumWage.textContent = money(baseWage);
    nightAmount.textContent = money(nightTotal);
    specialAmount.textContent = money(specialTotal);
    cleaningAmount.textContent = money(cleaningTotal);
    estimatedTotal.textContent = money(referenceTotal);
    actualPayResult.textContent = money(receivedPay);
    difference.textContent = money(shortfall);

    resultStatus.textContent =
      shortfall > 0 ? "Estimate" : "No difference";

    resultMessage.textContent =
      shortfall > 0
        ? "This estimate shows a possible difference. Keep your payslip and work records for verification."
        : "No difference was identified using the information entered. Keep your payslip and work records for verification.";

    resultCard.classList.remove("hidden");
  }

  function clearAudit() {
    workerName.value = "";
    area.value = "area12";
    grade.value = "C";
    auditMonth.value = "";
    ordinaryShifts.value = "16";
    sundayHours.value = "0";
    holidayHours.value = "0";
    nightShifts.value = "0";
    specialShifts.value = "0";
    cleaningAllowance.checked = true;
    actualPay.value = "";
    feedbackConsent.checked = false;

    resultCard.classList.add("hidden");
    resultMessage.textContent = "";
    savedMessage.textContent = "";
    savedMessage.classList.add("hidden");
  }

  function getAuditRecord() {
    return {
      createdAt: new Date().toISOString(),
      workerName: workerName.value.trim(),
      area: area.value,
      grade: grade.value,
      auditMonth: auditMonth.value,
      ordinaryShifts: numberValue(ordinaryShifts),
      sundayHours: numberValue(sundayHours),
      holidayHours: numberValue(holidayHours),
      nightShifts: numberValue(nightShifts),
      specialShifts: numberValue(specialShifts),
      cleaningAllowance: cleaningAllowance.checked,
      actualPay: numberValue(actualPay),
      feedbackConsent: feedbackConsent.checked,
      estimatedReferenceTotal: estimatedTotal.textContent,
      estimatedShortfall: difference.textContent
    };
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

  function exportAudit() {
    const record = getAuditRecord();

    const report = [
      "Civic Ledger Wage Audit",
      "",
      "Audit month: " + (record.auditMonth || "Not entered"),
      "Wage area: " + record.area,
      "Security grade: " + record.grade,
      "Ordinary shifts: " + record.ordinaryShifts,
      "Sunday hours: " + record.sundayHours,
      "Public-holiday hours: " + record.holidayHours,
      "Night shifts: " + record.nightShifts,
      "Qualifying allowance shifts: " + record.specialShifts,
      "Actual pay: " + money(record.actualPay),
      "Estimated reference total: " + record.estimatedReferenceTotal,
      "Possible estimated shortfall: " + record.estimatedShortfall,
      "",
      "This is an independent estimate and must be checked against payslips, contracts, rosters and the applicable agreement."
    ].join("");

    const blob = new Blob([report], {
      type: "text/plain"
    });

      "This is an independent estimate and must be checked against payslips, contracts, rosters and the applicable agreement."
    ].join("
");

    const blob = new Blob([report], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "civic-ledger-wage-audit.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  auditButton.addEventListener("click", calculateAudit);
  clearButton.addEventListener("click", clearAudit);
  saveButton.addEventListener("click", saveAudit);
  exportButton.addEventListener("click", exportAudit);
});