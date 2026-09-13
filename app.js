"use strict";

const WAGE_RATES = {
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

const NIGHT_ALLOWANCE = 8;
const SPECIAL_ALLOWANCE = 10.5;
const CLEANING_ALLOWANCE = 32;

function getNumber(id) {
  const element = document.getElementById(id);

  if (!element) {
    return 0;
  }

  const value = Number(element.value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2
  }).format(amount);
}

function showMessage(message) {
  const messageElement = document.getElementById("resultMessage");

  if (messageElement) {
    messageElement.textContent = message;
  }
}

function runAudit() {
  const areaElement = document.getElementById("area");
  const gradeElement = document.getElementById("grade");

  if (!areaElement || !gradeElement) {
    alert("The calculator fields could not be found.");
    return;
  }

  const area = areaElement.value;
  const grade = gradeElement.value;

  const minimumWage = WAGE_RATES[area][grade];
  const nightAmount =
    getNumber("nightShifts") * NIGHT_ALLOWANCE;
  const specialAmount =
    getNumber("specialShifts") * SPECIAL_ALLOWANCE;

  const cleaningCheckbox =
    document.getElementById("cleaningAllowance");

  const cleaningAmount =
    cleaningCheckbox && cleaningCheckbox.checked
      ? CLEANING_ALLOWANCE
      : 0;

  const actualPay = getNumber("actualPay");

  const estimatedTotal =
    minimumWage +
    nightAmount +
    specialAmount +
    cleaningAmount;

  const difference =
    Math.max(0, estimatedTotal - actualPay);

  document.getElementById("minimumWage").textContent =
    formatMoney(minimumWage);

  document.getElementById("nightAmount").textContent =
    formatMoney(nightAmount);

  document.getElementById("specialAmount").textContent =
    formatMoney(specialAmount);

  document.getElementById("cleaningAmount").textContent =
    formatMoney(cleaningAmount);

  document.getElementById("estimatedTotal").textContent =
    formatMoney(estimatedTotal);

  document.getElementById("actualPayResult").textContent =
    formatMoney(actualPay);

  document.getElementById("difference").textContent =
    formatMoney(difference);

  document.getElementById("resultCard").classList.remove("hidden");

  if (actualPay === 0) {
    showMessage(
      "Enter the actual amount received to compare the figures."
    );
  } else if (difference > 0) {
    showMessage(
      "This estimate shows a possible difference. Keep your payslip and work records for verification."
    );
  } else {
    showMessage(
      "No estimated shortfall was detected using the information entered."
    );
  }
}

function clearForm() {
  document.getElementById("workerName").value = "";
  document.getElementById("ordinaryShifts").value = 16;
  document.getElementById("sundayHours").value = 0;
  document.getElementById("holidayHours").value = 0;
  document.getElementById("nightShifts").value = 0;
  document.getElementById("specialShifts").value = 0;
  document.getElementById("actualPay").value = "";
  document.getElementById("resultCard").classList.add("hidden");
}

function saveAudit() {
  const record = {
    area: document.getElementById("area").value,
    grade: document.getElementById("grade").value,
    ordinaryShifts: getNumber("ordinaryShifts"),
    sundayHours: getNumber("sundayHours"),
    holidayHours: getNumber("holidayHours"),
    nightShifts: getNumber("nightShifts"),
    specialShifts: getNumber("specialShifts"),
    actualPay: getNumber("actualPay"),
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(
    "civicLedgerAudit",
    JSON.stringify(record)
  );

  alert("Audit saved on this device.");
}

document.addEventListener("DOMContentLoaded", function () {
  const auditButton = document.getElementById("auditButton");
  const clearButton = document.getElementById("clearButton");
  const saveButton = document.getElementById("saveButton");

  if (auditButton) {
    auditButton.addEventListener("click", runAudit);
  }

  if (clearButton) {
    clearButton.addEventListener("click", clearForm);
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveAudit);
  }
});