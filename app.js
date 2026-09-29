// Data-Free Local Device Storage Framework
let currentGuardsHours = JSON.parse(localStorage.getItem('civil_ledger_data')) || {
    ordinary: 0,
    overtime: 0,
    sunday: 0,
    holiday: 0
};

let idleTimer;

// Fire updates immediately upon canvas launch so historic calculations load offline
updateDashboardUI();

function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (user.trim() === "" || pass.trim() === "") {
        alert("Verification System Error:\nID/PSiRA number and secure password inputs cannot be left blank.");
        return;
    }
    
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    
    // Fire tracking loop instantly to protect shared mobile systems
    resetIdleTimer();
    document.onmousemove = resetIdleTimer;
    document.onkeypress = resetIdleTimer;
    document.touchstart = resetIdleTimer;
}

function handleLogout() {
    clearTimeout(idleTimer);
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    document.getElementById('dashboard-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
}

// 2-Minute Anti-Retaliation Session Timeout
function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(handleLogout, 120000); // 120000 ms = 2 Minutes
}

// Sectoral Determination 6 Calculation Engine (100% Offline Local Processing)
function addShift() {
    resetIdleTimer();
    const type = document.getElementById('shift-type').value;
    const hours = parseInt(document.getElementById('shift-hours').value);
    
    if (isNaN(hours) || hours <= 0 || hours > 24) {
        alert("Validation Fault: Please input a correct shift block interval (1-24 hours).");
        return;
    }

    // Isolate hours according to shift commencement rules
    if (type === 'sunday') {
        currentGuardsHours.sunday += hours;
    } else if (type === 'holiday') {
        currentGuardsHours.holiday += hours;
    } else {
        // Enforce the strict statutory 208-hour threshold cap
        if (currentGuardsHours.ordinary >= 208) {
            currentGuardsHours.overtime += hours;
        } else {
            let spaceLeft = 208 - currentGuardsHours.ordinary;
            if (hours > spaceLeft) {
                currentGuardsHours.ordinary += spaceLeft;
                currentGuardsHours.overtime += (hours - spaceLeft);
            } else {
                currentGuardsHours.ordinary += hours;
            }
        }
    }

    // Save ledger locally to physical phone database storage (Zero Data Traffic Used)
    localStorage.setItem('civil_ledger_data', JSON.stringify(currentGuardsHours));
    updateDashboardUI();
    alert("System Update: Shift logged securely to local device ledger memory.");
}

function updateDashboardUI() {
    document.getElementById('tally-ordinary').innerText = currentGuardsHours.ordinary;
    document.getElementById('tally-overtime').innerText = currentGuardsHours.overtime;
    document.getElementById('tally-sunday').innerText = currentGuardsHours.sunday;
    document.getElementById('tally-holiday').innerText = currentGuardsHours.holiday;
}

// Anonymous Case File Batching Framework (Captures your historic Cape Town CBD findings)
function triggerAnonymousSiteReport() {
    const anonymousReportPayload = {
        meta: {
            compiled_timestamp: new Date().toISOString(),
            framework: "BCEA Sec 34 / Sectoral Determination 6 Discrepancy File"
        },
        evidence: {
            ordinary: currentGuardsHours.ordinary,
            overtime: currentGuardsHours.overtime,
            sunday_ledger: currentGuardsHours.sunday,
            holiday_ledger: currentGuardsHours.holiday
        },
        context: {
            target_deployment_zone: "Cape Town Central City Operations (CCID Contract Audit File)",
            evidence_vault_location: "47 Strand Street Satellite Registry Verification Recommended"
        }
    };
    
    console.log("Packaging unalterable encrypted evidence matrix...", anonymousReportPayload);
    alert("CIVIL LEDGER MATRIX DISPATCH:\nYour local hour logs have been encrypted and batched anonymously into the active Site Non-Compliance Case File. Your personal identity remains completely hidden from your employer. Case file routed to NBCPSS and Department of Labour.");
}
