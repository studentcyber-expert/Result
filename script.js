/* =====================
   YEAR AUTO LOAD
===================== */

const yearBox = document.getElementById("year");

for (let i = 2026; i >= 2000; i--) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    yearBox.appendChild(option);
}


/* =====================
   PROGRESS BAR
===================== */

let progressInterval = null;

function startProgress() {
    const container = document.getElementById("progressBar");
    const fill      = document.getElementById("progressFill");
    const text      = document.getElementById("progressText");

    /* রিসেট */
    fill.style.width  = "0%";
    text.textContent  = "0%";
    container.style.display = "block";

    let progress = 0;

    progressInterval = setInterval(() => {
        /* 90% পর্যন্ত simulate করে, বাকিটা response এলে জাম্প করবে */
        const remaining = 90 - progress;
        const step      = remaining * 0.1 + Math.random() * 2;
        progress        = Math.min(progress + step, 90);

        fill.style.width = progress.toFixed(1) + "%";
        text.textContent = Math.floor(progress) + "%";
    }, 250);
}

function completeProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }

    const container = document.getElementById("progressBar");
    const fill      = document.getElementById("progressFill");
    const text      = document.getElementById("progressText");

    /* ১০০% এ নিয়ে যাও */
    fill.style.width = "100%";
    text.textContent = "100%";

    /* সামান্য দেরিতে লুকাও */
    setTimeout(() => {
        container.style.display = "none";
        fill.style.width  = "0%";
        text.textContent  = "0%";
    }, 500);
}


/* =====================
   CHECK RESULT
===================== */

async function checkResult() {

    const exam  = document.getElementById("exam").value;
    const board = document.getElementById("board").value;
    const year  = document.getElementById("year").value;
    const roll  = document.getElementById("roll").value;
    const reg   = document.getElementById("reg").value.trim();

    if (!roll) {
        alert("Enter Roll Number");
        return;
    }

    /* reg value: user input অথবা %00 */
    const regValue = reg !== "" ? reg : "%00";

    document.getElementById("result").innerHTML = "";
    startProgress();

    const url = `https://api.bangladeshgov.org/?exam=${exam}&year=${year}&board=${board}&roll=${roll}&reg=${regValue}`;

    try {

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        if (data.status !== "success") {
            showError("Result not found, please try with correct roll and registration");
            return;
        }

        createResult(data);

    } catch (error) {

        showError("API Error or Server Problem");
        console.log(error);

    } finally {

        completeProgress();

    }

}


/* =====================
   ERROR SHOW
===================== */

function showError(message) {
    document.getElementById("result").innerHTML = `
        <div class="error">${message}</div>
    `;
}


/* =====================
   RESULT DESIGN
===================== */

function createResult(data) {

    const student  = data.student;
    const result   = data.result;
    const subjects = data.subjects;

    let rows = "";

    subjects.forEach(sub => {
        rows += `
            <tr>
                <td>${sub.code}</td>
                <td>${sub.name}</td>
                <td>${sub.mark || "-"}</td>
                <td class="grade">${sub.grade}</td>
                <td class="ca">${sub.ca ? "Yes" : "No"}</td>
            </tr>
        `;
    });

    document.getElementById("result").innerHTML = `
        <div class="result-card" id="printArea">

            <div class="result-header">
                <h2>${student.exam} Result ${student.year}</h2>
                <div class="status ${result.status === "PASS" ? "pass" : "fail"}">
                    ${result.status}
                </div>
            </div>

            <div class="summary">
                <div class="summary-box">
                    <h2>${result.gpa}</h2>
                    <p>GPA</p>
                </div>
                <div class="summary-box">
                    <h2>${subjects.length}</h2>
                    <p>Subjects</p>
                </div>
                <div class="summary-box">
                    <h2>${student.group}</h2>
                    <p>Group</p>
                </div>
            </div>

            <h2 class="section-title">Student Information</h2>

            <div class="info-grid">
                ${infoBox("Name",         student.name)}
                ${infoBox("Roll",         student.roll)}
                ${infoBox("Registration", student.regno)}
                ${infoBox("Father Name",  student.father)}
                ${infoBox("Mother Name",  student.mother)}
                ${infoBox("Board",        student.board)}
                ${infoBox("Exam",         student.exam)}
                ${infoBox("Year",         student.year)}
                ${infoBox("Group",        student.group)}
                ${infoBox("Type",         student.type)}
                ${infoBox("Session",      student.session)}
                ${infoBox("Result",       result.detail)}
                <div class="info full">
                    <strong>Institute</strong>
                    <span>${student.institute}</span>
                </div>
            </div>

            <h2 class="section-title">Subject Result</h2>

            <div class="table-box">
                <table>
                    <tr>
                        <th>Code</th>
                        <th>Subject</th>
                        <th>Mark</th>
                        <th>Grade</th>
                        <th>CA</th>
                    </tr>
                    ${rows}
                </table>
            </div>

            <div class="action-area">
                <button class="action-btn copy-btn" onclick="copyResult()">Copy</button>
                <button class="action-btn print-btn" onclick="printResult()">Print</button>
            </div>

        </div>
    `;

}


/* =====================
   INFO BOX
===================== */

function infoBox(title, value) {
    return `
        <div class="info">
            <strong>${title}</strong>
            <span>${value || "-"}</span>
        </div>
    `;
}


/* =====================
   COPY RESULT
===================== */

function copyResult() {
    let text = document.getElementById("printArea").innerText;
    navigator.clipboard.writeText(text);
    alert("Result Copied");
}


/* =====================
   PRINT RESULT
===================== */

function printResult() {
    let content = document.getElementById("printArea").innerHTML;
    let win = window.open("", "", "width=900,height=700");
    win.document.write(`
        <html>
        <head>
            <title>Result</title>
            <style>
                body { font-family: Arial; padding: 20px; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    win.print();
}
