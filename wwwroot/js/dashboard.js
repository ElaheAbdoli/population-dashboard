
// ==========================================================
// Population Dashboard - dashboard.js
// ==========================================================

let dimDate = [];
let dimRegion = [];
let dimPop = [];

let poBirth = [];
let poDeath = [];
let poFamily = [];
let poMarriage = [];
let predictPop = [];

let trCollStudent = [];
let trCollStudent2 = [];
let trGraduated = [];
let trStudent = [];

let woCommercialPct = [];
let woCommercial = [];
let woEmpTotal = [];
let woUnempTotal = [];

let workIndus = [];


// ==========================================================
// JSON files - all 17 tables
// ==========================================================

const DATA = [
    ["dim_date.json", "dimDate"],
    ["dim_region.json", "dimRegion"],
    ["dim_pop.json", "dimPop"],

    ["po_birth.json", "poBirth"],
    ["po_death.json", "poDeath"],
    ["po_family_count_total.json", "poFamily"],
    ["po_marriage.json", "poMarriage"],
    ["predict_pop.json", "predictPop"],

    ["tr_coll_student.json", "trCollStudent"],
    ["tr_coll_student2.json", "trCollStudent2"],
    ["tr_garduated.json", "trGraduated"],
    ["tr_student.json", "trStudent"],

    ["wo_commercial_pct.json", "woCommercialPct"],
    ["wo_commercial_corp.json", "woCommercial"],
    ["wo_emp_total.json", "woEmpTotal"],
    ["wo_unemp_total.json", "woUnempTotal"],

    ["work_idus.json", "workIndus"]
];


// ==========================================================
// Helpers
// ==========================================================

function toNumber(value) {

    if (value === null || value === undefined || value === "") {
        return null;
    }

    const n = Number(
        String(value)
            .replace(/,/g, "")
            .replace(/٬/g, "")
            .trim()
    );

    return Number.isFinite(n) ? n : null;
}

function formatComma(value) {

    if (value === null || value === undefined || value === "")
        return "—";

    return Number(value)
        .toLocaleString("fa-IR", {maximumFractionDigits: 0});

}

function cleanText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}


function formatNumber(value, decimals = 1) {

    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString("fa-IR", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: 0
    });
}


function calculateChange(startValue, endValue) {

    const start = toNumber(startValue);
    const end = toNumber(endValue);

    if (
        start === null ||
        end === null ||
        start === 0
    ) {
        return null;
    }

    return ((end - start) / start) * 100;
}


function setValue(elementId, value) {

    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = formatNumber(value);
    }
}


function setChange(elementId, startValue, endValue) {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    const value = calculateChange(
        startValue,
        endValue
    );

    element.classList.remove(
        "down",
        "neutral"
    );

    if (value === null) {

        element.textContent = "—";
        element.classList.add("neutral");
        return;
    }

    let arrow = "";

    if (value > 0) {
        arrow = "↑ ";
    }
    else if (value < 0) {
        arrow = "↓ ";
    }

    element.textContent =
        arrow +
        Math.abs(value).toLocaleString(
            "fa-IR",
            {
                maximumFractionDigits: 2
            }
        ) +
        "%";

    if (value < 0) {
        element.classList.add("down");
    }
}


function getYears() {

    return [
        ...new Set(
            dimDate
                .map(row => toNumber(row["سال"]))
                .filter(year => year !== null)
        )
    ].sort((a, b) => a - b);
}


function getPeriod(year) {

    const row = dimDate.find(
        item =>
            toNumber(item["سال"]) ===
            toNumber(year)
    );

    if (!row) {
        return null;
    }

    return cleanText(
        row["دوره"] ||
        row["y_range"]
    );
}

function findPeriod(data, year) {

    const targetPeriod = getPeriod(year);

    console.log(
        "Searching period:",
        targetPeriod
    );

    const result = (data || []).find(row => {

        return cleanText(row["دوره"]) ===
            cleanText(targetPeriod);

    });

    console.log(
        "Found row:",
        result
    );

    return result;
}
// ==========================================================
// Find rows
// ==========================================================

function findYearRegion(
    data,
    year,
    region
) {

    return (data || []).find(row => {

        return (
            toNumber(row["سال"]) === toNumber(year) &&
            cleanText(row["گروه"]) ===
            cleanText(region)
        );

    });
}


function findYear(
    data,
    year
) {

    return (data || []).find(row => {

        return (
            toNumber(row["سال"]) ===
            toNumber(year)
        );

    });
}


function findPeriod(
    data,
    year
) {

    const targetPeriod =
        getPeriod(year);

    if (!targetPeriod) {
        return null;
    }

    return (data || []).find(row => {

        return (
            cleanText(row["دوره"]) ===
            cleanText(targetPeriod)
        );

    });
}


// ==========================================================
// JSON loading
// ==========================================================

async function loadJson(fileName) {

    const url =
        "data/" + fileName;

    console.log(
        "Loading JSON:",
        url
    );

    const response =
        await fetch(
            url,
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            fileName +
            " -> HTTP " +
            response.status
        );
    }

    const data =
        await response.json();

    console.log(
        "Loaded:",
        fileName,
        "| Rows:",
        Array.isArray(data)
            ? data.length
            : 1
    );

    return data;
}


// ==========================================================
// Load all 17 JSON files
// ==========================================================

async function loadData() {

    console.log(
        "========== DATA LOAD START =========="
    );

    for (
        const [fileName, variableName]
        of DATA
    ) {

        try {

            const data =
                await loadJson(fileName);

            switch (variableName) {

                case "dimDate":
                    dimDate = data;
                    break;

                case "dimRegion":
                    dimRegion = data;
                    break;

                case "dimPop":
                    dimPop = data;
                    break;

                case "poBirth":
                    poBirth = data;
                    break;

                case "poDeath":
                    poDeath = data;
                    break;

                case "poFamily":
                    poFamily = data;
                    break;

                case "poMarriage":
                    poMarriage = data;
                    break;

                case "predictPop":
                    predictPop = data;
                    break;

                case "trCollStudent":
                    trCollStudent = data;
                    break;

                case "trCollStudent2":
                    trCollStudent2 = data;
                    break;

                case "trGraduated":
                    trGraduated = data;
                    break;

                case "trStudent":
                    trStudent = data;
                    break;

                case "woCommercialPct":
                    woCommercialPct = data;
                    break;

                case "woCommercial":
                    woCommercial = data;
                    break;

                case "woEmpTotal":
                    woEmpTotal = data;
                    break;

                case "woUnempTotal":
                    woUnempTotal = data;
                    break;

                case "workIndus":
                    workIndus = data;
                    break;
            }

        }
        catch (error) {

            console.error(
                "JSON LOAD ERROR:",
                fileName,
                error
            );
        }
    }

    console.log(
        "========== DATA LOAD FINISHED =========="
    );

    createYearRangeSlicer();

    createRegionSlicer();

    createPopulationSlicer();

    updateDashboard();
    updateEducationDashboard();
    updateLaborDashboard();
    if (typeof updateEmploymentDashboard === "function") {
        if (typeof updateEmploymentDashboard === "function") {
            updateEmploymentDashboard();
        }
    }
}


// ==========================================================
// Year range slicer
// ==========================================================

function createYearRangeSlicer() {

    const startSlider =
        document.getElementById(
            "startYear"
        );

    const endSlider =
        document.getElementById(
            "endYear"
        );

    const years = getYears();

    if (
        !startSlider ||
        !endSlider ||
        years.length === 0
    ) {

        console.error(
            "Year range slicer elements not found."
        );

        return;
    }

    const maxIndex =
        years.length - 1;

    startSlider.min = 0;
    startSlider.max = maxIndex;

    endSlider.min = 0;
    endSlider.max = maxIndex;

    const defaultStart = years.indexOf(1398) >= 0 ? years.indexOf(1398) : 0;
    const defaultEnd = years.indexOf(1404) >= 0 ? years.indexOf(1404) : maxIndex;
    startSlider.value = defaultStart;
    endSlider.value = defaultEnd;

    startSlider.addEventListener(
        "input",
        updateYearRange
    );

    endSlider.addEventListener(
        "input",
        updateYearRange
    );

    updateYearRange();
}


function updateYearRange() {

    const startSlider =
        document.getElementById(
            "startYear"
        );

    const endSlider =
        document.getElementById(
            "endYear"
        );

    if (
        !startSlider ||
        !endSlider
    ) {
        return;
    }

    const years = getYears();

    let startIndex =
        Number(startSlider.value);

    let endIndex =
        Number(endSlider.value);

    if (startIndex > endIndex) {

        if (
            document.activeElement ===
            startSlider
        ) {

            endIndex = startIndex;
            endSlider.value = endIndex;

        }
        else {

            startIndex = endIndex;
            startSlider.value = startIndex;
        }
    }

    const startYear =
        years[startIndex];

    const endYear =
        years[endIndex];

    const startLabel =
        document.getElementById(
            "startYearLabel"
        );

    const endLabel =
        document.getElementById(
            "endYearLabel"
        );

    if (startLabel) {
        startLabel.textContent = formatNumber(startYear,0);
    }

    if (endLabel) {
        endLabel.textContent = formatNumber(endYear,0);
    }

    const selected =
        document.getElementById(
            "rangeSelected"
        );

    if (
        selected &&
        years.length > 1
    ) {

        const max =
            years.length - 1;

        const left =
            (startIndex / max) * 100;

        const right =
            (endIndex / max) * 100;

        selected.style.left =
            left + "%";

        selected.style.right =
            (100 - right) + "%";
    }

    try {
        updateDashboard();
    }
    catch (e) {
        console.error("Population Error:", e);
    }


    try {
        updateEducationDashboard();
    }
    catch (e) {
        console.error("Education Error:", e);
    }


    try {
        updateLaborDashboard();
    }
    catch (e) {
        console.error("Labor Error:", e);
    }


    try {
        if (typeof updateEmploymentDashboard === "function") {
            updateEmploymentDashboard();
        }
    }
    catch (e) {
        console.error("Employment Error:", e);
    }
}


function getStartYear() {

    const years = getYears();

    const slider =
        document.getElementById(
            "startYear"
        );

    if (!slider) {
        return null;
    }

    return years[
        Number(slider.value)
    ];
}


function getEndYear() {

    const years = getYears();

    const slider =
        document.getElementById(
            "endYear"
        );

    if (!slider) {
        return null;
    }

    return years[
        Number(slider.value)
    ];
}


// ==========================================================
// Region slicer
// ==========================================================

function createRegionSlicer() {

    const select =
        document.getElementById(
            "regionSelect"
        );

    if (!select) {

        console.error(
            "regionSelect not found."
        );

        return;
    }

    select.innerHTML = "";

    const regions = [
        ...new Set(
            dimRegion
                .map(
                    row =>
                        cleanText(
                            row["گروه"]
                        )
                )
                .filter(Boolean)
        )
    ];

    regions.forEach(region => {

        const option =
            document.createElement(
                "option"
            );

        option.value = region;
        option.textContent = region;

        select.appendChild(option);
    });

    if (
        [...select.options].some(
            option =>
                option.value ===
                "کشور"
        )
    ) {

        select.value = "کشور";
    }

    select.addEventListener("change", () => { updateDashboard(); updateEducationDashboard(); updateLaborDashboard(); if(typeof updateEmploymentDashboard === "function") updateEmploymentDashboard(); });
}


// ==========================================================
// Population slicer - ready for pages that use it
// ==========================================================

function createPopulationSlicer() {

    const select =
        document.getElementById(
            "populationSelect"
        );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    dimPop.forEach(row => {

        const value =
            cleanText(
                row["گروه جمعیت"]
            );

        if (!value) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });

    select.addEventListener(
        "change",
        updateDashboard
    );
}


// ==========================================================
// Main dashboard
// ==========================================================

function updateDashboard() {

    const startYear =
        getStartYear();

    const endYear =
        getEndYear();

    const regionSelect =
        document.getElementById(
            "regionSelect"
        );

    const region =
        regionSelect
            ? regionSelect.value
            : "کشور";

    if (
        startYear === null ||
        endYear === null
    ) {

        return;
    }

    console.log(
        "Dashboard update:",
        startYear,
        "->",
        endYear,
        "| Region:",
        region
    );


    // ------------------------------------------------------
    // Population
    // Card = End Year
    // Change = Start -> End
    // Display = Thousands
    // ------------------------------------------------------

    let start =
        findYearRegion(
            predictPop,
            startYear,
            region
        );

    let end =
        findYearRegion(
            predictPop,
            endYear,
            region
        );

    setValue(
        "popValue",
        end
            ? toNumber(end["کل"])
            : null
    );

    setChange(
        "popChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Birth
    // ------------------------------------------------------

    start =
        findYearRegion(
            poBirth,
            startYear,
            region
        );

    end =
        findYearRegion(
            poBirth,
            endYear,
            region
        );

    setValue(
        "birthValue",
        end
            ? toNumber(end["کل"])
            : null
    );

    setChange(
        "birthChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Death
    // ------------------------------------------------------

    start =
        findYearRegion(
            poDeath,
            startYear,
            region
        );

    end =
        findYearRegion(
            poDeath,
            endYear,
            region
        );

    setValue(
        "deathValue",
        end
            ? toNumber(end["کل"])
            : null
    );

    setChange(
        "deathChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Marriage / Divorce
    // ------------------------------------------------------

    start =
        findYear(
            poMarriage,
            startYear
        );

    end =
        findYear(
            poMarriage,
            endYear
        );

    setValue(
        "marriageValue",
        end
            ? toNumber(end["ازدواج"])
            : null
    );

    setChange(
        "marChange",
        start
            ? toNumber(start["ازدواج"])
            : null,
        end
            ? toNumber(end["ازدواج"])
            : null
    );

    setValue(
        "divorceValue",
        end
            ? toNumber(end["طلاق"])
            : null
    );

    setChange(
        "divorceChange",
        start
            ? toNumber(start["طلاق"])
            : null,
        end
            ? toNumber(end["طلاق"])
            : null
    );


    // ------------------------------------------------------
    // Employment
    // ------------------------------------------------------

    start =
        findYearRegion(
            woEmpTotal,
            startYear,
            region
        );

    end =
        findYearRegion(
            woEmpTotal,
            endYear,
            region
        );

    setPercentValue(
        "empValue",
        end
            ? toNumber(end["کل"])
            : null
    );

    setChange(
        "empChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Unemployment
    // ------------------------------------------------------

    start =
        findYearRegion(
            woUnempTotal,
            startYear,
            region
        );

    end =
        findYearRegion(
            woUnempTotal,
            endYear,
            region
        );

    setPercentValue(
        "unempValue",
        end
            ? toNumber(end["کل"])
            : null
    );

    setChange(
        "unempChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Graduated - TR tables use dim_date period
    // ------------------------------------------------------

    start =
        findPeriod(
            trGraduated,
            startYear
        );

    end =
        findPeriod(
            trGraduated,
            endYear
        );

    setValue(
        "graduValue",
        end
            ? toNumber(end["کل"])
            : null
    );

    setChange(
        "graduChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Charts
    // ------------------------------------------------------

    updateGenderChart(
        startYear,
        endYear,
        region
    );

    updateBirthDeathChart(
        startYear,
        endYear,
        region
    );

    updateMarriageChart(
        startYear,
        endYear
    );

    updatePopulationInsight(
        startYear,
        endYear,
        region
    );
}


// ==========================================================
// Tornado chart
// Male left / Female right
// No horizontal cursor
// Years in center
// Icons at bottom
// ==========================================================

function updateGenderChart(
    startYear,
    endYear,
    region
) {

    const container =
        document.getElementById(
            "genderChart"
        );

    if (!container) {
        return;
    }

    const selectedYears =
        getYears()
            .filter(
                year =>
                    year >= startYear &&
                    year <= endYear
            )
            .sort(
                (a, b) => b - a
            );

    const rows = [];

    selectedYears.forEach(year => {

        const row =
            findYearRegion(
                predictPop,
                year,
                region
            );

        if (!row) {
            return;
        }

        rows.push({
            year: year,
            male:
                toNumber(row["مرد"]) || 0,
            female:
                toNumber(row["زن"]) || 0
        });
    });

    if (!rows.length) {

        container.innerHTML =
            "<div>داده‌ای وجود ندارد</div>";

        return;
    }

    const maxValue =
        Math.max(
            ...rows.flatMap(
                row => [
                    row.male,
                    row.female
                ]
            )
        ) || 1;


    let html = `
        <div class="tornado-header">
            <div class="male-title">مرد</div>
            <div class="center-title"></div>
            <div class="female-title">زن</div>
        </div>
    `;


    rows.forEach(row => {

        const maleWidth =
            Math.max(
                2,
                row.male /
                maxValue *
                235
            );

        const femaleWidth =
            Math.max(
                2,
                row.female /
                maxValue *
                235
            );


        html += `
            <div class="tornado-row">

                <div class="tornado-side male-side">

                    <span class="tornado-value">
                        ${formatNumber(
            row.male,
            1
        )}
                    </span>

                    <div
                        class="tornado-bar male"
                        style="
                            width:${maleWidth}px
                        ">
                    </div>

                </div>


                <div class="tornado-year">
                    ${row.year}
                </div>


                <div class="tornado-side female-side">

                    <div
                        class="tornado-bar female"
                        style="
                            width:${femaleWidth}px
                        ">
                    </div>

                    <span class="tornado-value">
                        ${formatNumber(
            row.female,
            1
        )}
                    </span>

                </div>

            </div>
        `;
    });


    html += `
        <div class="tornado-icons">

            <div class="gender-icon male">
                ♂
            </div>

            <div class="tornado-center-line"></div>

            <div class="gender-icon female">
                ♀
            </div>

        </div>
    `;


    container.innerHTML = html;
}


// ==========================================================
// Generic SVG line chart
// ==========================================================

function itemPercentLabel(value, series) {
    const isPercent = (series || []).some(x => x && x.percent === true);
    return isPercent
        ? Number(value).toLocaleString("fa-IR", { maximumFractionDigits: 1 }) + "%"
        : formatNumber(value, 0);
}

function drawLineChart(
    container,
    years,
    series
) {

    if (
        !container ||
        !years.length
    ) {

        if (container) {
            container.innerHTML =
                "<div>داده‌ای وجود ندارد</div>";
        }

        return;
    }

    const width = 570;
    const height = 118;

    const left = 45;
    const right = 8;
    const top = 9;
    const bottom = 20;

    const values =
        series
            .flatMap(
                item => item.values
            )
            .filter(
                value =>
                    value !== null &&
                    Number.isFinite(value)
            );

    if (!values.length) {

        container.innerHTML =
            "<div>داده‌ای وجود ندارد</div>";

        return;
    }

    let minValue =
        Math.min(...values);

    let maxValue =
        Math.max(...values);

    const padding =
        (maxValue - minValue) *
        0.12 || 1;

    minValue =
        Math.min(
            0,
            minValue - padding
        );

    maxValue += padding;

    const plotWidth =
        width - left - right;

    const plotHeight =
        height - top - bottom;

    function x(index) {

        if (years.length === 1) {

            return (
                left +
                plotWidth / 2
            );
        }

        return (
            left +
            index *
            plotWidth /
            (years.length - 1)
        );
    }

    function y(value) {

        return (
            top +
            (maxValue - value) /
            (maxValue - minValue) *
            plotHeight
        );
    }


    let svg = `
        <svg
            viewBox="
                0 0
                ${width}
                ${height}
            "
            preserveAspectRatio="none">
    `;


    for (let i = 0; i <= 3; i++) {

        const axisValue =
            minValue +
            (maxValue - minValue) *
            i / 3;

        const yy =
            y(axisValue);

        svg += `
            <line
                class="chart-grid"
                x1="${left}"
                y1="${yy}"
                x2="${width - right}"
                y2="${yy}">
            </line>

            <text
                class="chart-axis-label"
                x="${left - 5}"
                y="${yy + 3}"
                text-anchor="end">
                ${itemPercentLabel(axisValue, series)}
            </text>
        `;
    }


    series.forEach(item => {

        let path = "";
        let started = false;

        item.values.forEach(
            (value, index) => {

                if (value === null) {

                    started = false;
                    return;
                }

                path +=
                    (
                        started
                            ? "L "
                            : "M "
                    ) +
                    x(index) +
                    " " +
                    y(value) +
                    " ";

                started = true;
            }
        );


        svg += `
            <path
                class="chart-line"
                d="${path}"
                stroke="${item.color}"
                ${item.dash ? `stroke-dasharray="${item.dash}"` : ""}
                ${item.width ? `stroke-width="${item.width}"` : ""}>
            </path>
        `;


        item.values.forEach(
            (value, index) => {

                if (value === null) {
                    return;
                }

                svg += `
                    <circle
                       class="chart-dot"
                       cx="${x(index)}"
                       cy="${y(value)}"
                       r="4"
                       fill="${item.color}">

                       <title>
                          ${item.name}
                          | سال: ${formatNumber(years[index],0)}
                          | مقدار: ${item.percent ? Number(value).toLocaleString("fa-IR", {maximumFractionDigits:1}) + "%" : formatNumber(value)}
                       </title>
                    </circle>
                `;
            }
        );
    });


    years.forEach(
        (year, index) => {

            if (
                years.length > 10 &&
                index % 2 !== 0
            ) {

                return;
            }

            svg += `
                <text
                    class="chart-axis-label"
                    x="${x(index)}"
                    y="${height - 4}"
                    text-anchor="middle">
                    ${year}
                </text>
            `;
        }
    );


    svg += "</svg>";


    let legend =
        '<div class="chart-legend">';

    series.forEach(item => {

        legend += `
            <span class="legend-item">

                <span
                    class="legend-dot"
                    style="
                        background:${item.color}
                    ">
                </span>

                ${item.name}

            </span>
        `;
    });

    legend += "</div>";


    container.innerHTML =
        legend +
        svg;
}


// ==========================================================
// Birth / Death chart
// ==========================================================

function updateBirthDeathChart(
    startYear,
    endYear,
    region
) {
    const container = document.getElementById("birthDeathChart");
    if (!container) return;
    const years = getYears().filter(y => y >= startYear && y <= endYear);
    const births = years.map(y => { const r=findYearRegion(poBirth,y,region); return r ? toNumber(r["کل"]) : null; });
    const deaths = years.map(y => { const r=findYearRegion(poDeath,y,region); return r ? toNumber(r["کل"]) : null; });
    const net = years.map((y,i) => births[i] != null && deaths[i] != null ? births[i]-deaths[i] : null);
    drawLineChart(container, years, [
        {name:"تولد", color:"#3f73bd", values:births},
        {name:"فوت", color:"#ed5a63", values:deaths},
        {name:"برآیند", color:"#7f858b", values:net, dash:"7 5", width:2}
    ]);
}


// ==========================================================
// Marriage / Divorce chart
// ==========================================================

function updateMarriageChart(
    startYear,
    endYear
) {
    const container = document.getElementById("marriageChart");
    if (!container) return;
    const years = getYears().filter(y => y >= startYear && y <= endYear);
    const marriages = years.map(y => { const r=findYear(poMarriage,y); return r ? toNumber(r["ازدواج"]) : null; });
    const divorces = years.map(y => { const r=findYear(poMarriage,y); return r ? toNumber(r["طلاق"]) : null; });
    const net = years.map((y,i) => marriages[i] != null && divorces[i] != null ? marriages[i]-divorces[i] : null);
    drawLineChart(container, years, [
        {name:"ازدواج", color:"#3f73bd", values:marriages},
        {name:"طلاق", color:"#ed5a63", values:divorces},
        {name:"برآیند", color:"#7f858b", values:net, dash:"7 5", width:2}
    ]);
}


// ==========================================================
// Navigation
// ==========================================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );

    const pages =
        document.querySelectorAll(
            ".page"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const target =
                    button.dataset.page;

                buttons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                pages.forEach(
                    page =>
                        page.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );

                const targetPage =
                    document.getElementById(
                        target
                    );

                if (targetPage) {

                    targetPage.classList.add(
                        "active"
                    );
                }
            }
        );
    });
}

function setPercentValue(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    if (value === null || value === undefined) {
        element.textContent = "—";
        return;
    }

    element.textContent =
        Number(value).toLocaleString("fa-IR", {
            maximumFractionDigits: 1
        }) + "%";
}
// ==========================================================
// Start
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupNavigation();

        loadData();
    }
);

// Compatibility wrapper: older labor functions call lineChart().
// The canonical renderer in this project is drawLineChart().
function lineChart(container, years, series) {
    return drawLineChart(container, years, series);
}

// ==========================================================
// EDUCATION PAGE
// ==========================================================

function updateEducationDashboard() {

    const startYear = getStartYear();
    const endYear = getEndYear();

    console.log(
        "Start Year:",
        startYear,
        "Period:",
        getPeriod(startYear)
    );

    console.log(
        "End Year:",
        endYear,
        "Period:",
        getPeriod(endYear)
    );
    if (
        startYear === null ||
        endYear === null
    ) {
        return;
    }

    // ------------------------------------------------------
    // Students
    // ------------------------------------------------------

    let start =
        findPeriod(
            trStudent,
            startYear
        );

    let end =
        findPeriod(
            trStudent,
            endYear
        );

    setValue(
        "eduStudentValue",
        end
            ? toNumber(end["کل"]) / 1000
            : null
    );

    setChange(
        "eduStudentChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // College students
    // ------------------------------------------------------

    start =
        findPeriod(
            trCollStudent,
            startYear
        );

    end =
        findPeriod(
            trCollStudent,
            endYear
        );

    setValue(
        "eduCollegeValue",
        end
            ? toNumber(end["کل"]) / 1000
            : null
    );

    setChange(
        "eduCollegeChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Graduated
    // ------------------------------------------------------

    start =
        findPeriod(
            trGraduated,
            startYear
        );

    end =
        findPeriod(
            trGraduated,
            endYear
        );

    setValue(
        "eduGraduatedValue",
        end
            ? toNumber(end["کل"]) / 1000
            : null
    );

    setChange(
        "eduGraduatedChange",
        start
            ? toNumber(start["کل"])
            : null,
        end
            ? toNumber(end["کل"])
            : null
    );


    // ------------------------------------------------------
    // Female share in higher education
    // ------------------------------------------------------

    if (end) {

        const total =
            toNumber(end["کل"]);

        const female =
            toNumber(end["زن"]);

        const share =
            total
                ? (female / total) * 100
                : null;

        const element =
            document.getElementById(
                "eduFemaleShare"
            );

        if (element) {

            element.textContent =
                share === null
                    ? "—"
                    : share.toLocaleString(
                        "fa-IR",
                        {
                            maximumFractionDigits: 1
                        }
                    ) + "%";
        }
    }


    updateEducationTrend(
        startYear,
        endYear
    );

    updateStudentTornado(
        startYear,
        endYear
    );

    updateCollegeTornado(
        startYear,
        endYear
    );

    updateMajorChart();

    updateEducationInsight(
        startYear,
        endYear
    );
}

function updateEducationTrend(
    startYear,
    endYear
) {

    const container =
        document.getElementById(
            "educationTrend"
        );

    if (!container) {
        return;
    }

    const years =
        getYears().filter(
            year =>
                year >= startYear &&
                year <= endYear
        );

    const students =
        years.map(
            year => {

                const row =
                    findPeriod(
                        trStudent,
                        year
                    );

                return row
                    ? toNumber(row["کل"])
                    : null;
            }
        );

    const college =
        years.map(
            year => {

                const row =
                    findPeriod(
                        trCollStudent,
                        year
                    );

                return row
                    ? toNumber(row["کل"])
                    : null;
            }
        );

    const graduated =
        years.map(
            year => {

                const row =
                    findPeriod(
                        trGraduated,
                        year
                    );

                return row
                    ? toNumber(row["کل"])
                    : null;
            }
        );

    drawLineChart(
        container,
        years,
        [
            {
                name: "دانش‌آموز",
                color: "#3f73bd",
                values: students
            },
            {
                name: "دانشجو",
                color: "#e15759",
                values: college
            },
            {
                name: "فارغ‌التحصیل",
                color: "#2b7a4b",
                values: graduated
            }
        ]
    );
}

function createEducationTornado(
    containerId,
    data,
    startYear,
    endYear,
    maleField,
    femaleField
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    const selectedYears =
        getYears()
            .filter(
                year =>
                    year >= startYear &&
                    year <= endYear
            )
            .sort(
                (a, b) => b - a
            );

    const rows = [];

    selectedYears.forEach(
        year => {

            const row =
                findPeriod(
                    data,
                    year
                );

            if (!row) {
                return;
            }

            rows.push({
                year: year,
                male:
                    toNumber(
                        row[maleField]
                    ) || 0,
                female:
                    toNumber(
                        row[femaleField]
                    ) || 0
            });
        }
    );

    if (!rows.length) {

        container.innerHTML =
            "داده‌ای وجود ندارد";

        return;
    }

    const maxValue =
        Math.max(
            ...rows.flatMap(
                row => [
                    row.male,
                    row.female
                ]
            )
        ) || 1;

    let html = `
        <div class="tornado-header">
            <div class="male-title">مرد</div>
            <div></div>
            <div class="female-title">زن</div>
        </div>
    `;

    rows.forEach(row => {

        const maleWidth =
            Math.max(
                2,
                row.male /
                maxValue *
                95
            );

        const femaleWidth =
            Math.max(
                2,
                row.female /
                maxValue *
                95
            );

        html += `
            <div class="tornado-row">

                <div class="tornado-side male-side">

                    <span class="tornado-value">
                        ${formatNumber(
            row.male / 1000,
            0
        )}
                    </span>

                    <div
                        class="tornado-bar male"
                        style="width:${maleWidth}px">
                    </div>

                </div>

                <div class="tornado-year">
                    ${row.year}
                </div>

                <div class="tornado-side female-side">

                    <div
                        class="tornado-bar female"
                        style="width:${femaleWidth}px">
                    </div>

                    <span class="tornado-value">
                        ${formatNumber(
            row.female / 1000,
            0
        )}
                    </span>

                </div>

            </div>
        `;
    });

    html += `
        <div class="tornado-icons">
            <div class="gender-icon male">♂</div>
            <div class="tornado-center-line"></div>
            <div class="gender-icon female">♀</div>
        </div>
    `;

    container.innerHTML = html;
}


function updateStudentTornado(
    startYear,
    endYear
) {

    createEducationTornado(
        "studentTornado",
        trStudent,
        startYear,
        endYear,
        "پسر",
        "دختر"
    );
}


function updateCollegeTornado(
    startYear,
    endYear
) {

    createEducationTornado(
        "collegeTornado",
        trCollStudent,
        startYear,
        endYear,
        "مرد",
        "زن"
    );
}

function updateMajorChart() {

    const container =
        document.getElementById(
            "majorChart"
        );

    if (!container) {
        return;
    }

    if (!trCollStudent2.length) {

        container.innerHTML =
            "داده‌ای وجود ندارد";

        return;
    }

    const rows =
        trCollStudent2
            .map(row => ({
                name:
                    cleanText(
                        row["دوره تحصیلی"]
                    ),
                value:
                    toNumber(row["کل"]) || 0
            }))
            .sort(
                (a, b) =>
                    b.value - a.value
            )
            .slice(0, 8);

    const max =
        Math.max(
            ...rows.map(
                row => row.value
            )
        ) || 1;

    container.innerHTML =
        rows.map(row => {

            const width =
                row.value /
                max *
                100;

            return `
                <div class="edu-major-row">

                    <div class="edu-major-name">
                        ${row.name}
                    </div>

                    <div class="edu-major-bar-wrap">

                        <div
                            class="edu-major-bar"
                            style="
                                width:${width}%
                            ">
                        </div>

                    </div>

                    <div class="edu-major-value">
                        ${formatNumber(
                row.value / 1000,
                1
            )}
                    </div>

                </div>
            `;

        }).join("");
}




function updatePopulationInsight(
    startYear,
    endYear,
    region
) {
    const container = document.getElementById("populationInsight");
    if (!container) return;

    const years = getYears().filter(y => y >= startYear && y <= endYear);

    const births = years.map(y => {
        const r = findYearRegion(poBirth, y, region);
        return r ? toNumber(r["کل"]) : null;
    });
    const deaths = years.map(y => {
        const r = findYearRegion(poDeath, y, region);
        return r ? toNumber(r["کل"]) : null;
    });

    const marriageRows = years.map(y => findYear(poMarriage, y));
    const marriages = marriageRows.map(r => r ? toNumber(r["ازدواج"]) : null);
    const divorces = marriageRows.map(r => r ? toNumber(r["طلاق"]) : null);

    function first(values) {
        return values.find(v => v !== null && v !== undefined);
    }
    function last(values) {
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] !== null && values[i] !== undefined) return values[i];
        }
        return null;
    }

    const b0=first(births), b1=last(births);
    const d0=first(deaths), d1=last(deaths);
    const m0=first(marriages), m1=last(marriages);
    const v0=first(divorces), v1=last(divorces);

    const birthChange = b0 != null && b1 != null ? calculateChange(b0,b1) : null;
    const deathChange = d0 != null && d1 != null ? calculateChange(d0,d1) : null;
    const marriageChange = m0 != null && m1 != null ? calculateChange(m0,m1) : null;
    const divorceChange = v0 != null && v1 != null ? calculateChange(v0,v1) : null;

    const netSeries = years.map((y,i) =>
        births[i] != null && deaths[i] != null ? births[i]-deaths[i] : null
    );
    const net0 = b0 != null && d0 != null ? b0-d0 : null;
    const net1 = b1 != null && d1 != null ? b1-d1 : null;
    const marriageNet0 = m0 != null && v0 != null ? m0-v0 : null;
    const marriageNet1 = m1 != null && v1 != null ? m1-v1 : null;

    let minNet = Infinity, minNetYear = null;
    netSeries.forEach((v,i) => {
        if (v != null && v < minNet) {
            minNet = v;
            minNetYear = years[i];
        }
    });

    container.innerHTML = `
        <div class="insight-line">
            در بازه <strong>${formatNumber(startYear,0)} تا ${formatNumber(endYear,0)}</strong>،
            تولد از <strong>${formatNumber(b0,0)}</strong> به <strong>${formatNumber(b1,0)}</strong>
            (${birthChange == null ? "—" : formatNumber(birthChange,1)+"%"})
            و فوت از <strong>${formatNumber(d0,0)}</strong> به <strong>${formatNumber(d1,0)}</strong>
            (${deathChange == null ? "—" : formatNumber(deathChange,1)+"%"}) رسیده است.
        </div>
        <div class="insight-line">
            برآیند طبیعی، یعنی تولد منهای فوت، از
            <strong>${formatNumber(net0,0)}</strong> به <strong>${formatNumber(net1,0)}</strong>
            رسیده و کمترین مقدار آن در این بازه مربوط به سال
            <strong>${formatNumber(minNetYear,0)}</strong> است؛ این الگو نشان‌دهنده کاهش
            رشد طبیعی جمعیت در انتهای بازه است.
        </div>
        <div class="insight-line">
            ازدواج از <strong>${formatNumber(m0,0)}</strong> به <strong>${formatNumber(m1,0)}</strong>
            (${marriageChange == null ? "—" : formatNumber(marriageChange,1)+"%"})
            و طلاق از <strong>${formatNumber(v0,0)}</strong> به <strong>${formatNumber(v1,0)}</strong>
            (${divorceChange == null ? "—" : formatNumber(divorceChange,1)+"%"}) تغییر کرده است؛
            برآیند ازدواج منهای طلاق نیز از
            <strong>${formatNumber(marriageNet0,0)}</strong> به
            <strong>${formatNumber(marriageNet1,0)}</strong> رسیده است.
        </div>
    `;
}

function updateEducationInsight(
    startYear,
    endYear
) {
    const container = document.getElementById("educationInsight");
    if (!container) return;

    // Education source tables are period-based and some series do not contain
    // every endpoint in dim_date. Use the first/last available period inside
    // the selected interval instead of manufacturing a missing value.
    function periodStart(row) {
        const p = cleanText(row && row["دوره"]);
        const m = p.match(/\d{4}/);
        return m ? Number(m[0]) : null;
    }

    function firstInRange(data) {
        return (data || [])
            .filter(r => {
                const y = periodStart(r);
                return y !== null && y >= startYear && y <= endYear;
            })
            .sort((a,b) => periodStart(a) - periodStart(b))[0] || null;
    }

    function lastInRange(data) {
        return (data || [])
            .filter(r => {
                const y = periodStart(r);
                return y !== null && y >= startYear && y <= endYear;
            })
            .sort((a,b) => periodStart(b) - periodStart(a))[0] || null;
    }

    const studentStart = firstInRange(trStudent);
    const studentEnd = lastInRange(trStudent);
    const collegeStart = firstInRange(trCollStudent);
    const collegeEnd = lastInRange(trCollStudent);
    const graduateStart = firstInRange(trGraduated);
    const graduateEnd = lastInRange(trGraduated);

    const studentChange = studentStart && studentEnd
        ? calculateChange(studentStart["کل"], studentEnd["کل"]) : null;
    const collegeChange = collegeStart && collegeEnd
        ? calculateChange(collegeStart["کل"], collegeEnd["کل"]) : null;
    const graduateChange = graduateStart && graduateEnd
        ? calculateChange(graduateStart["کل"], graduateEnd["کل"]) : null;

    const majors = Array.isArray(trCollStudent2) ? trCollStudent2 : [];
    const totalMajors = majors.reduce((s,r) => s + (toNumber(r["کل"]) || 0), 0);
    const humanities = majors.find(r => cleanText(r["دوره تحصیلی"]) === "علوم انسانی");
    const basic = majors.find(r => cleanText(r["دوره تحصیلی"]) === "علوم پایه");

    const humanitiesBasicShare = totalMajors
        ? ((toNumber(humanities?.["کل"]) || 0) + (toNumber(basic?.["کل"]) || 0))
          / totalMajors * 100
        : null;

    const serviceStartRow = (workIndus || []).find(r => toNumber(r["سال"]) === toNumber(startYear));
    const serviceEndRow = (workIndus || []).find(r => toNumber(r["سال"]) === toNumber(endYear));
    const agricultureStart = serviceStartRow ? toNumber(serviceStartRow["کشاورزی"]) : null;
    const agricultureEnd = serviceEndRow ? toNumber(serviceEndRow["کشاورزی"]) : null;
    const serviceStart = serviceStartRow ? toNumber(serviceStartRow["خدمات"]) : null;
    const serviceEnd = serviceEndRow ? toNumber(serviceEndRow["خدمات"]) : null;

    const studentPeriodText =
        studentStart && studentEnd
            ? `${formatNumber(periodStart(studentStart),0)} تا ${formatNumber(periodStart(studentEnd),0)}`
            : "داده کافی موجود نیست";

    const collegePeriodText =
        collegeStart && collegeEnd
            ? `${formatNumber(periodStart(collegeStart),0)} تا ${formatNumber(periodStart(collegeEnd),0)}`
            : "داده کافی موجود نیست";

    const graduatePeriodText =
        graduateStart && graduateEnd
            ? `${formatNumber(periodStart(graduateStart),0)} تا ${formatNumber(periodStart(graduateEnd),0)}`
            : "داده کافی موجود نیست";

    let text = `
        <div class="insight-line">
            در بازه انتخابی <strong>${formatNumber(startYear,0)} تا ${formatNumber(endYear,0)}</strong>،
            تغییر تعداد دانش‌آموزان در داده‌های موجود
            (${studentPeriodText}) برابر
            <strong>${studentChange === null ? "—" : formatNumber(studentChange,1) + "%"}</strong>
            و تغییر تعداد دانشجویان
            (${collegePeriodText}) برابر
            <strong>${collegeChange === null ? "—" : formatNumber(collegeChange,1) + "%"}</strong>
            است.
        </div>
        <div class="insight-line">
            تغییر تعداد فارغ‌التحصیلان بر اساس آخرین دوره قابل‌دسترس
            (${graduatePeriodText}) برابر
            <strong>${graduateChange === null ? "—" : formatNumber(graduateChange,1) + "%"}</strong>
            است.
        </div>
        <div class="insight-line">
            در ترکیب رشته‌های دانشگاهی موجود، علوم انسانی و علوم پایه روی‌هم
            <strong>${humanitiesBasicShare === null ? "—" : formatNumber(humanitiesBasicShare,1) + "%"}</strong>
            از مجموع رشته‌های ثبت‌شده را تشکیل می‌دهند.
        </div>
    `;

    if (serviceStart !== null && serviceEnd !== null &&
        agricultureStart !== null && agricultureEnd !== null) {
        text += `
            <div class="insight-line">
                هم‌زمان، سهم خدمات در ساختار اشتغال از
                <strong>${formatNumber(serviceStart,1)}%</strong>
                به <strong>${formatNumber(serviceEnd,1)}%</strong>
                رسیده و سهم کشاورزی از
                <strong>${formatNumber(agricultureStart,1)}%</strong>
                به <strong>${formatNumber(agricultureEnd,1)}%</strong>
                تغییر کرده است.
            </div>
            <div class="insight-line">
                این هم‌زمانی نشان می‌دهد الگوی تحصیلی و ساختار اشتغال خدماتی در این داده‌ها
                می‌توانند در یک روایت تحلیلی کنار هم دیده شوند؛ با این حال، داده‌های موجود
                <strong>رابطه علّی</strong> بین انتخاب رشته و افزایش سهم خدمات را اثبات نمی‌کنند.
            </div>
        `;
    }

    container.innerHTML = text;
}

// =====================================================
// LABOR DASHBOARD
// =====================================================


function updateLaborDashboard() {

    const startYear = getStartYear();
    const endYear = getEndYear();

    const region =
        document.getElementById("regionSelect")?.value || "کشور";


    if (!startYear || !endYear)
        return;



    let start =
        getYearRow(
            woCommercialPct,
            startYear,
            region
        );


    let end =
        getYearRow(
            woCommercialPct,
            endYear,
            region
        );


    setValue(
        "laborParticipationValue",
        end ? end["کل"] : null
    );


    setChange(
        "laborParticipationChange",
        start ? start["کل"] : null,
        end ? end["کل"] : null
    );





    start =
        getYearRow(
            woUnempTotal,
            startYear,
            region
        );


    end =
        getYearRow(
            woUnempTotal,
            endYear,
            region
        );



    setValue(
        "laborUnemploymentValue",
        end ? end["کل"] : null
    );


    setChange(
        "laborUnemploymentChange",
        start ? start["کل"] : null,
        end ? end["کل"] : null
    );





    start =
        getYearRow(
            woEmpTotal,
            startYear,
            region
        );


    end =
        getYearRow(
            woEmpTotal,
            endYear,
            region
        );



    setValue(
        "laborEmploymentValue",
        end ? end["کل"] : null
    );


    setChange(
        "laborEmploymentChange",
        start ? start["کل"] : null,
        end ? end["کل"] : null
    );





    start = getYearRow(woCommercial, startYear, region) || getYearRowNoGroup(woCommercial, startYear);
    end = getYearRow(woCommercial, endYear, region) || getYearRowNoGroup(woCommercial, endYear);



    setValue(
        "laborActiveValue",
        end ? end["جمعیت فعال"] : null
    );


    setChange(
        "laborActiveChange",
        start ? start["جمعیت فعال"] : null,
        end ? end["جمعیت فعال"] : null
    );



    drawLaborWorkerChart(
        startYear,
        endYear,
        region
    );



    drawIndustryChart(
        startYear,
        endYear,
        region
    );


    drawLaborGenderChart(
        startYear,
        endYear,
        region
    );
    


    createLaborTable(
        startYear,
        endYear,
        region
    );

    updateLaborInsight(startYear,endYear);


    createLaborInsight(
        startYear,
        endYear,
        region
    );

}
function num(value) { return toNumber(value); }

function pct(value, decimals=1) {
    if (value === null || value === undefined || value === "") return "—";
    const n = toNumber(value);
    return n === null ? "—" : n.toLocaleString("fa-IR", {maximumFractionDigits:decimals, minimumFractionDigits:decimals}) + "%";
}

function yr(data, year, region) {
    return getYearRow(data, year, region);
}

function getYearRow(data, year, region) {

    const normalizeGroup=v=>String(v??"").trim().replace(/ي/g,"ی").replace(/ك/g,"ک");
    const target=normalizeGroup(region);
    return (data || []).find(x =>
        Number(x["سال"]) === Number(year) &&
        (!x["گروه"] || normalizeGroup(x["گروه"]) === target)
    );

}

function createLaborInsight(startYear,endYear,region) {
    const e=document.getElementById("laborInsight");
    if(!e)return;
    const a=workIndus.find(x=>Number(x["سال"])===Number(startYear));
    const b=workIndus.find(x=>Number(x["سال"])===Number(endYear));
    if(!a||!b){e.innerHTML="• داده کافی برای تحلیل تغییر ساختار بخش‌های اقتصادی در این بازه وجود ندارد.";return;}
    const sa=toNumber(a["خدمات"]),sb=toNumber(b["خدمات"]),aa=toNumber(a["کشاورزی"]),ab=toNumber(b["کشاورزی"]),ia=toNumber(a["صنعت"]),ib=toNumber(b["صنعت"]);
    const sd=sb-sa,ad=ab-aa,id=ib-ia;
    e.innerHTML=`<div>• <b>افزایش سهم خدمات:</b> از <b>${sa.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> در ${formatNumber(startYear,0)} به <b>${sb.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> در ${formatNumber(endYear,0)}؛ یعنی <b>${sd>=0?"+":""}${sd.toLocaleString("fa-IR",{maximumFractionDigits:1})} واحد درصد</b>.</div><div>• <b>کاهش سهم کشاورزی:</b> از <b>${aa.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> به <b>${ab.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b>؛ یعنی <b>${ad>=0?"+":""}${ad.toLocaleString("fa-IR",{maximumFractionDigits:1})} واحد درصد</b>. سهم صنعت نیز از ${ia.toLocaleString("fa-IR",{maximumFractionDigits:1})}% به ${ib.toLocaleString("fa-IR",{maximumFractionDigits:1})}% تغییر کرده است.</div>`;
}
function getYearRowNoGroup(data, year) {

    return (data || []).find(x =>
        Number(x["سال"]) === Number(year)
    );

}
function drawLaborWorkerChart(startYear, endYear, region) {
    const container = document.getElementById("workerChart");
    if (!container) return;

    const yearsList = getYears().filter(y => y >= startYear && y <= endYear);
    const rows = yearsList.map(year => {
        const row = getYearRow(woCommercial, year, region) || getYearRowNoGroup(woCommercial, year);
        return row ? {
            year,
            employed: toNumber(row["جمعیت شاغل"]) || 0,
            unemployed: toNumber(row["جمعیت بیکار"]) || 0,
            active: toNumber(row["جمعیت فعال"]) || 0
        } : null;
    }).filter(Boolean);

    if (!rows.length) {
        container.innerHTML = '<div class="no-data">داده‌ای وجود ندارد</div>';
        return;
    }

    const maxValue = Math.max(...rows.map(x => x.active), ...rows.map(x => x.employed), 1);
    const BAR_HEIGHT = 124;

    container.innerHTML = `
        <div class="labor-bar-chart active-trend-stage">
            <div class="labor-bars-layer">
                ${rows.map(x => {
                    const employedHeight = Math.max(2, (x.employed / maxValue) * BAR_HEIGHT);
                    const unemployedHeight = Math.max(2, (x.unemployed / maxValue) * BAR_HEIGHT);
                    return `
                    <div class="labor-column" data-year="${x.year}" data-active="${x.active}">
                        <div class="labor-bars">
                            <div class="labor-employed"
                                 style="height:${employedHeight}px"
                                 onmousemove="showLaborTooltip(event,'${x.year}','جمعیت شاغل','${formatComma(x.employed)}')"
                                 onmouseleave="hideLaborTooltip()">
                                <span>${formatComma(x.employed)}</span>
                            </div>
                            <div class="labor-unemployed"
                                 style="height:${unemployedHeight}px"
                                 onmousemove="showLaborTooltip(event,'${x.year}','جمعیت بیکار','${formatComma(x.unemployed)}')"
                                 onmouseleave="hideLaborTooltip()">
                                <span>${formatComma(x.unemployed)}</span>
                            </div>
                        </div>
                        <div class="labor-year">${formatNumber(x.year,0)}</div>
                    </div>`;
                }).join("")}
            </div>
            <svg class="active-trend-overlay" aria-label="روند جمعیت فعال">
                <polyline class="active-trend-polyline" fill="none" stroke="#3f73bd" stroke-width="2.5"></polyline>
            </svg>
        </div>
    `;

    // Build the trend from the actual rendered column centers.
    // This guarantees that the X coordinates are identical to the bar columns,
    // instead of relying on a guessed 60px spacing.
    requestAnimationFrame(() => {
        const stage = container.querySelector(".active-trend-stage");
        const overlay = container.querySelector(".active-trend-overlay");
        const polyline = container.querySelector(".active-trend-polyline");
        const columns = [...container.querySelectorAll(".labor-column")];
        if (!stage || !overlay || !polyline || !columns.length) return;

        const stageRect = stage.getBoundingClientRect();
        overlay.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);
        overlay.setAttribute("width", stageRect.width);
        overlay.setAttribute("height", stageRect.height);

        const baseline = stageRect.bottom - 31; // bar baseline, above year labels
        const top = stageRect.top + 4;
        const plotHeight = Math.max(20, baseline - top);

        const points = columns.map((col, i) => {
            const rect = col.getBoundingClientRect();
            const active = rows[i].active;
            const x = rect.left - stageRect.left + rect.width / 2;
            const y = baseline - (active / maxValue) * plotHeight - stageRect.top;
            return {
                x, y,
                year: rows[i].year,
                active
            };
        });

        polyline.setAttribute(
            "points",
            points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
        );
        polyline.style.pointerEvents = "none";

        // Transparent/visible hit targets are positioned on the exact trend points.
        // They provide a real tooltip without disturbing the line/bar alignment.
        let pointLayer = stage.querySelector(".active-trend-points");
        if (!pointLayer) {
            pointLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            pointLayer.setAttribute("class", "active-trend-points");
            pointLayer.style.position = "absolute";
            pointLayer.style.left = "10px";
            pointLayer.style.right = "10px";
            pointLayer.style.top = "5px";
            pointLayer.style.width = "calc(100% - 20px)";
            pointLayer.style.height = "145px";
            pointLayer.style.pointerEvents = "none";
            pointLayer.style.zIndex = "6";
            stage.appendChild(pointLayer);
        }
        pointLayer.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);
        pointLayer.setAttribute("width", stageRect.width);
        pointLayer.setAttribute("height", stageRect.height);
        pointLayer.innerHTML = points.map(p => `
            <circle class="active-trend-point"
                    cx="${p.x.toFixed(2)}"
                    cy="${p.y.toFixed(2)}"
                    r="7" fill="transparent"
                    pointer-events="all"
                    onmousemove="showLaborTooltip(event,'${p.year}','جمعیت فعال','${formatComma(p.active)}')"
                    onmouseleave="hideLaborTooltip()"></circle>
        `).join("");
    });
}

function showLaborTooltip(event, year, title, value) {

    const tooltip =
        document.getElementById("laborTooltip");

    if (!tooltip) return;


    tooltip.innerHTML = `
        <b>${title}</b><br>
        سال: ${formatNumber(year,0)}<br>
        مقدار: ${formatComma(value)}
    `;


    tooltip.style.display = "block";

    tooltip.style.left =
        event.pageX + 10 + "px";

    tooltip.style.top =
        event.pageY + 10 + "px";
}



function hideLaborTooltip() {

    const tooltip =
        document.getElementById("laborTooltip");

    if (!tooltip) return;


    tooltip.style.display = "none";

}

function drawActiveTrendChart(startYear, endYear, region) {
    const container = document.getElementById("workerChart");
    if (!container) return;
    const yearsList = getYears().filter(y => y >= startYear && y <= endYear);
    const values = yearsList.map(year => {
        const row = getYearRowNoGroup(woCommercial, year);
        return row ? toNumber(row["جمعیت فعال"]) : null;
    });
    lineChart(container, yearsList, [{
        name: "جمعیت فعال",
        color: "#12239E",
        values
    }]);
}
function drawIndustryChart(startYear, endYear, region) {

    const container =
        document.getElementById("industryChart");

    if (!container) return;


    const yearsList =
        getYears()
            .filter(y =>
                Number(y) >= Number(startYear) &&
                Number(y) <= Number(endYear)
            );


    const rows = yearsList.map(year => {

        const row =
            workIndus.find(x =>
                Number(x["سال"]) === Number(year)
            );

        return {
            year: year,
            agriculture: row ? toNumber(row["کشاورزی"]) : 0,
            industry: row ? toNumber(row["صنعت"]) : 0,
            services: row ? toNumber(row["خدمات"]) : 0
        };

    });


    if (!rows.length) {

        container.innerHTML =
            "<div class='no-data'>داده‌ای وجود ندارد</div>";

        return;
    }


    let html = `

        <div class="industry-stacked-chart">

            <div class="industry-axis">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>

            <div class="industry-rows">
    `;


    rows.forEach(x => {

        const total =
            x.agriculture +
            x.industry +
            x.services;


        let agricultureWidth = 0;
        let industryWidth = 0;
        let servicesWidth = 0;


        if (total > 0) {

            agricultureWidth =
                (x.agriculture / total) * 100;

            industryWidth =
                (x.industry / total) * 100;

            servicesWidth =
                (x.services / total) * 100;

        }


        html += `

            <div class="industry-row">

                <div class="industry-year">
                    ${formatNumber(x.year,0)}
                </div>


                <div class="industry-bar">

                    <div
                        class="industry-segment agriculture"
                        style="width:${agricultureWidth}%">

                        <span>
                            ${x.agriculture.toFixed(1)}%
                        </span>

                    </div>


                    <div
                        class="industry-segment industry"
                        style="width:${industryWidth}%">

                        <span>
                            ${x.industry.toFixed(1)}%
                        </span>

                    </div>


                    <div
                        class="industry-segment services"
                        style="width:${servicesWidth}%">

                        <span>
                            ${x.services.toFixed(1)}%
                        </span>

                    </div>

                </div>

            </div>

        `;

    });


    html += `

            </div>


            <div class="industry-legend">

                <div class="industry-legend-item">
                    <span class="legend-box agriculture"></span>
                    کشاورزی
                </div>


                <div class="industry-legend-item">
                    <span class="legend-box industry"></span>
                    صنعت
                </div>


                <div class="industry-legend-item">
                    <span class="legend-box services"></span>
                    خدمات
                </div>

            </div>

        </div>

    `;


    container.innerHTML = html;
}
function drawLaborGenderChart(startYear, endYear, region) {
    const container=document.getElementById("laborGenderChart");
    if(!container) return;
    const yearsList=getYears().filter(y=>y>=startYear&&y<=endYear);
    const norm=v=>String(v??"").trim().replace(/ي/g,"ی").replace(/ك/g,"ک");
    const rows=yearsList.map(y=>{
        let r=(woCommercialPct||[]).find(x=>Number(x["سال"])===Number(y)&&norm(x["گروه"])===norm(region));
        if(!r) r=(woCommercialPct||[]).find(x=>Number(x["سال"])===Number(y)&&norm(x["گروه"])==="کشور");
        return r?{year:y,male:toNumber(r["مرد"]),female:toNumber(r["زن"])}:null;
    }).filter(Boolean);
    if(!rows.length){container.innerHTML='<div class="no-data">داده‌ای برای مشارکت اقتصادی زن و مرد وجود ندارد</div>';return;}
    const male=rows.map(x=>x.male), female=rows.map(x=>x.female);
    const maleDelta=male[0]!=null&&male.at(-1)!=null?male.at(-1)-male[0]:null;
    const femaleDelta=female[0]!=null&&female.at(-1)!=null?female.at(-1)-female[0]:null;
    drawLineChart(container,rows.map(x=>x.year),[
        {name:"مرد",values:male,color:"#3f73bd",percent:true},
        {name:"زن",values:female,color:"#ed5a63",percent:true}
    ]);
    container.insertAdjacentHTML("beforeend",`<div class="gender-change"><div class="gender-kpi male">تغییر مشارکت مردان: ${maleDelta==null?"—":maleDelta.toLocaleString("fa-IR",{maximumFractionDigits:1})+" واحد درصد"}</div><div class="gender-kpi female">تغییر مشارکت زنان: ${femaleDelta==null?"—":femaleDelta.toLocaleString("fa-IR",{maximumFractionDigits:1})+" واحد درصد"}</div></div>`);
}
function createLaborTable(startYear,endYear,region){
    const container=document.getElementById("laborTable"); if(!container)return;
    const row=(data,year,group)=> (data||[]).find(x=>Number(x["سال"])===Number(year)&&(x["گروه"]==null||cleanText(x["گروه"])===cleanText(group)));
    const c0=row(woCommercial,startYear,region),c1=row(woCommercial,endYear,region);
    const p0=row(woCommercialPct,startYear,region),p1=row(woCommercialPct,endYear,region);
    const u0=row(woUnempTotal,startYear,region),u1=row(woUnempTotal,endYear,region);
    const e0=row(woEmpTotal,startYear,region),e1=row(woEmpTotal,endYear,region);
    const items=[
      ["نرخ مشارکت اقتصادی",p0?.["کل"],p1?.["کل"],true],
      ["نرخ بیکاری",u0?.["کل"],u1?.["کل"],true],
      ["نرخ اشتغال",e0?.["کل"],e1?.["کل"],true],
      ["جمعیت فعال",c0?.["جمعیت فعال"],c1?.["جمعیت فعال"],false],
      ["جمعیت شاغل",c0?.["جمعیت شاغل"],c1?.["جمعیت شاغل"],false],
      ["جمعیت بیکار",c0?.["جمعیت بیکار"],c1?.["جمعیت بیکار"],false]
    ];
    const val=(v,isRate)=>{const n=toNumber(v);if(n==null||Number.isNaN(n))return "—";return isRate?n.toLocaleString("fa-IR",{maximumFractionDigits:1})+"%":formatComma(n)};
    const ch=(a,b)=>{const x=toNumber(a),y=toNumber(b);if(x==null||y==null||x===0)return "—";const q=(y-x)/x*100;return (q>0?"↑ ":q<0?"↓ ":"")+Math.abs(q).toLocaleString("fa-IR",{maximumFractionDigits:1})+"%"};
    container.innerHTML=`<div class="labor-table-scroll"><table class="labor-change-table"><colgroup><col class="col-name"><col><col><col></colgroup><thead><tr><th>عنوان شاخص</th><th>${formatNumber(startYear,0)}</th><th>${formatNumber(endYear,0)}</th><th>درصد تغییر</th></tr></thead><tbody>${items.map(x=>`<tr><td class="indicator-name">${x[0]}</td><td>${val(x[1],x[3])}</td><td>${val(x[2],x[3])}</td><td class="change-value">${ch(x[1],x[2])}</td></tr>`).join("")}</tbody></table></div>`;
}

function updateLaborInsight(startYear,endYear){
    const c=document.getElementById("laborInsight");if(!c)return;
    const a=workIndus.find(x=>Number(x["سال"])===Number(startYear));
    const b=workIndus.find(x=>Number(x["سال"])===Number(endYear));
    if(!a||!b){c.textContent="داده کافی برای روایت ساختار بخش‌های اشتغال وجود ندارد.";return;}
    const sa=toNumber(a["خدمات"]), sb=toNumber(b["خدمات"]), aa=toNumber(a["کشاورزی"]), ab=toNumber(b["کشاورزی"]), ia=toNumber(a["صنعت"]), ib=toNumber(b["صنعت"]);
    const sd=sb-sa, ad=ab-aa, id=ib-ia;
    c.innerHTML=`<div>• <b>خدمات:</b> سهم خدمات از <b>${sa.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> در ${formatNumber(startYear,0)} به <b>${sb.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> در ${formatNumber(endYear,0)} رسیده و <b>${sd>=0?"افزایش":"کاهش"} ${Math.abs(sd).toLocaleString("fa-IR",{maximumFractionDigits:1})} واحد درصدی</b> داشته است.</div><div>• <b>کشاورزی:</b> سهم کشاورزی از <b>${aa.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> به <b>${ab.toLocaleString("fa-IR",{maximumFractionDigits:1})}%</b> رسیده و <b>${ad<0?"کاهش":"افزایش"} ${Math.abs(ad).toLocaleString("fa-IR",{maximumFractionDigits:1})} واحد درصدی</b> داشته است؛ سهم صنعت نیز ${ib.toLocaleString("fa-IR",{maximumFractionDigits:1})}% در پایان دوره است.</div>`;
}

// ==========================================================
// EMPLOYMENT PAGE - data-backed implementation
// ==========================================================
function updateEmploymentDashboard() {
    const startYear=getStartYear(), endYear=getEndYear();
    const region=document.getElementById("regionSelect")?.value||"کشور";
    if(startYear==null||endYear==null)return;
    drawEmploymentAgeGender(startYear,endYear,region);
    drawEmploymentRegionTable(startYear,endYear);
    drawEmploymentDonuts(startYear,endYear);
    drawEmploymentTrend(startYear,endYear,region);
    createEmploymentInsight(startYear,endYear,region);
}
function drawEmploymentAgeGender(startYear,endYear,region){
    const c=document.getElementById("ageGenderChart"); if(!c)return;
    const norm=v=>String(v??"").trim().replace(/ي/g,"ی").replace(/ك/g,"ک");
    const wanted=["15 ساله","24-15 ساله","35-18 ساله"];
    const labels={"15 ساله":"۱۵ ساله","24-15 ساله":"۱۵ تا ۲۴ ساله","35-18 ساله":"۱۸ تا ۳۵ ساله"};
    const rows=getYears().filter(y=>y>=startYear&&y<=endYear).map(year=>{
        const base=(woUnempTotal||[]).filter(x=>Number(x["سال"])===Number(year)&&norm(x["گروه"])===norm(region));
        const fallback=(woUnempTotal||[]).filter(x=>Number(x["سال"])===Number(year)&&norm(x["گروه"])==="کشور");
        const source=base.length?base:fallback;
        const by=g=>source.find(x=>norm(x["گروه جمعیت"])===g);
        const items=wanted.map(g=>({g, female:by(g)?toNumber(by(g)["زن"]):null, male:by(g)?toNumber(by(g)["مرد"]):null}));
        return {year,items};
    }).filter(r=>r.items.some(x=>x.female!=null||x.male!=null));
    if(!rows.length){c.innerHTML='<div class="no-data">داده‌ای برای گروه‌های سنی وجود ندارد</div>';return;}
    const max=Math.max(...rows.flatMap(r=>r.items.flatMap(x=>[x.female||0,x.male||0])),1);
    const seg=(v,cls,title,year,side)=>v==null?"":`<div class="age-stack-segment ${cls}" style="width:${Math.max(1,(v/max)*100)}%" onmousemove="showAgeUnemploymentTooltip(event,'${year}','${title}','${v}')" onmouseleave="hideLaborTooltip()">${v>=4?pct(v):""}</div>`;
    c.innerHTML=`<div class="age-tornado-wrap"><div class="age-tornado-head"><div class="age-head female-head">زن</div><div class="age-head year-head">سال</div><div class="age-head male-head">مرد</div></div><div class="age-tornado-rows">${rows.map(r=>{
        const f=r.items.map((x,i)=>seg(x.female,["age15-f","age24-f","age35-f"][i],labels[x.g],r.year,"female")).join("");
        const m=r.items.map((x,i)=>seg(x.male,["age15-m","age24-m","age35-m"][i],labels[x.g],r.year,"male")).join("");
        return `<div class="age-tornado-row"><div class="age-stack female-stack" dir="rtl">${f}</div><div class="age-year">${formatNumber(r.year,0)}</div><div class="age-stack male-stack" dir="ltr">${m}</div></div>`;
    }).join("")}</div><div class="age-tornado-legend"><span><i class="age15-f"></i>۱۵ ساله</span><span><i class="age24-f"></i>۱۵ تا ۲۴ ساله</span><span><i class="age35-f"></i>۱۸ تا ۳۵ ساله</span></div></div>`;
}
function showAgeUnemploymentTooltip(event,year,group,value){
    const t=document.getElementById("laborTooltip")||document.querySelector(".labor-tooltip");
    if(!t)return;
    t.innerHTML=`<b>نرخ بیکاری ${group}</b><br>سال: ${formatNumber(year,0)}<br>مقدار: ${pct(value)}`;
    t.style.display="block"; t.style.position="fixed"; t.style.left=(event.clientX+12)+"px"; t.style.top=(event.clientY+12)+"px";
}
function drawEmploymentRegionTable(startYear,endYear){
    const c=document.getElementById("regionEmploymentTable");
    if(!c)return;

    const regions=["شهری","روستایی"];
    const norm=v=>String(v??"").trim().replace(/ي/g,"ی").replace(/ك/g,"ک");
    const metric=(data,year,g)=>{
        const r=(data||[]).find(x=>Number(x["سال"])===Number(year)&&norm(x["گروه"])===norm(g));
        return r?toNumber(r["کل"]):null;
    };
    const rows=regions.map(g=>({
        g,
        birthS:metric(poBirth,startYear,g), birthE:metric(poBirth,endYear,g),
        deathS:metric(poDeath,startYear,g), deathE:metric(poDeath,endYear,g),
        empS:metric(woEmpTotal,startYear,g), empE:metric(woEmpTotal,endYear,g),
        unS:metric(woUnempTotal,startYear,g), unE:metric(woUnempTotal,endYear,g),
        partS:metric(woCommercialPct,startYear,g), partE:metric(woCommercialPct,endYear,g)
    }));

    const ch=(a,b)=>a==null||b==null||a===0?null:(b-a)/a*100;
    const fmt=(v,rate=false)=>v==null?"—":rate?toNumber(v).toLocaleString("fa-IR",{maximumFractionDigits:1})+"%":formatComma(v);
    const chFmt=(a,b)=>{
        const q=ch(a,b);
        if(q==null)return "—";
        return (q>0?"↑ ":q<0?"↓ ":"")+Math.abs(q).toLocaleString("fa-IR",{maximumFractionDigits:1})+"%";
    };

    const metricRows=[
        ["تولد","birthS","birthE",false],
        ["فوت","deathS","deathE",false],
        ["نرخ اشتغال","empS","empE",true],
        ["نرخ بیکاری","unS","unE",true],
        ["نرخ مشارکت اقتصادی","partS","partE",true]
    ];

    // Matrix layout: indicator rows; city/rural as column groups; start/end/change nested beneath each group.
    c.innerHTML=`
      <div class="region-matrix-wrap">
        <table class="region-matrix">
          <thead>
            <tr>
              <th rowspan="2" class="matrix-indicator">شاخص</th>
              <th colspan="3" class="matrix-city">شهری</th>
              <th colspan="3" class="matrix-rural">روستایی</th>
            </tr>
            <tr>
              <th>مقدار شروع</th><th>مقدار پایان</th><th>تغییرات دوره</th>
              <th>مقدار شروع</th><th>مقدار پایان</th><th>تغییرات دوره</th>
            </tr>
          </thead>
          <tbody>
            ${metricRows.map(([label,ks,ke,isRate])=>{
                const city=rows[0], rural=rows[1];
                return `<tr>
                    <td class="matrix-indicator">${label}</td>
                    <td>${fmt(city[ks],isRate)}</td><td>${fmt(city[ke],isRate)}</td><td class="matrix-change">${chFmt(city[ks],city[ke])}</td>
                    <td>${fmt(rural[ks],isRate)}</td><td>${fmt(rural[ke],isRate)}</td><td class="matrix-change">${chFmt(rural[ks],rural[ke])}</td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
}

function drawEmploymentDonuts(startYear,endYear){
    const c=document.getElementById("regionDonutChart");if(!c)return;
    const regions=["شهری","روستایی"], ys=getYears().filter(y=>y>=startYear&&y<=endYear);
    const avg=(data,g,popGroup=null)=>{const vals=ys.map(y=>{let r=(data||[]).find(x=>Number(x["سال"])===Number(y)&&cleanText(x["گروه"])===cleanText(g)&&(!popGroup||cleanText(x["گروه جمعیت"])===cleanText(popGroup)));return r?toNumber(r["کل"]):null}).filter(v=>v!=null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
    const participation=regions.map(g=>avg(woCommercialPct,g));
    const unemployment=regions.map(g=>avg(woUnempTotal,g,"15 ساله"));
    const donut=(title,vals)=>{const clean=vals.map(v=>v??0),total=clean.reduce((a,v)=>a+v,0);if(!total)return `<div class="donut-box"><div class="donut-title">${title}</div><div class="no-data">داده‌ای وجود ندارد</div></div>`;let a=0,parts=[];clean.forEach((v,i)=>{const n=a+v/total*360;parts.push(`${i===0?"#8fb3df":"#2b7a4b"} ${a}deg ${n}deg`);a=n});return `<div class="donut-box"><div class="donut-title">${title} — میانگین ${formatNumber(startYear,0)} تا ${formatNumber(endYear,0)}</div><div class="donut-wrap compact"><div class="donut" style="background:conic-gradient(${parts.join(",")})"><div class="donut-hole">میانگین</div></div><div class="donut-legend"><div><span class="legend-swatch city"></span>شهر: ${pct(clean[0])}</div><div><span class="legend-swatch rural"></span>روستا: ${pct(clean[1])}</div></div></div></div>`};
    c.innerHTML=`<div class="two-donuts">${donut("میانگین نرخ بیکاری",unemployment)}${donut("میانگین نرخ مشارکت اقتصادی",participation)}</div>`;
}
function drawEmploymentTrend(a,b,r){
    const ys=getYears().filter(y=>y>=a&&y<=b);
    const emp=ys.map(y=>yr(woEmpTotal,y,r)?.["کل"]??null);
    const un=ys.map(y=>yr(woUnempTotal,y,r)?.["کل"]??null);
    const net=ys.map((y,i)=>emp[i]!=null&&un[i]!=null?toNumber(emp[i])-toNumber(un[i]):null);
    lineChart(document.getElementById("employmentTrendChart"),ys,[{name:"نرخ اشتغال",color:"#3f73bd",values:emp,percent:true},{name:"نرخ بیکاری",color:"#ed5a63",values:un,percent:true},{name:"برآیند",color:"#7f858b",values:net,dash:"7 5",width:2,percent:true}]);
}
function createEmploymentInsight(a,b,r){
    const c=document.getElementById("employmentInsight");if(!c)return;
    const e0=yr(woEmpTotal,a,r),e1=yr(woEmpTotal,b,r),u0=yr(woUnempTotal,a,r),u1=yr(woUnempTotal,b,r);
    const ec=e0&&e1?toNumber(e1["کل"])-toNumber(e0["کل"]):null,uc=u0&&u1?toNumber(u1["کل"])-toNumber(u0["کل"]):null;
    const cityE=yr(woEmpTotal,b,"شهری"),ruralE=yr(woEmpTotal,b,"روستایی"),cityU=yr(woUnempTotal,b,"شهری"),ruralU=yr(woUnempTotal,b,"روستایی");
    c.innerHTML=`<div>• در بازه ${a} تا ${b}، نرخ اشتغال کشور از <b>${pct(e0?.["کل"])}</b> به <b>${pct(e1?.["کل"])}</b> ${ec==null?"تغییر نکرده":ec>=0?`افزایش ${ec.toLocaleString("fa-IR",{maximumFractionDigits:1})} واحد درصدی داشته`:`کاهش ${Math.abs(ec).toLocaleString("fa-IR",{maximumFractionDigits:1})} واحد درصدی داشته`} است.</div><div>• در پایان دوره، نرخ اشتغال شهری <b>${pct(cityE?.["کل"])}</b> و روستایی <b>${pct(ruralE?.["کل"])}</b> و نرخ بیکاری شهری <b>${pct(cityU?.["کل"])}</b> و روستایی <b>${pct(ruralU?.["کل"])}</b> است؛ این تفاوت‌ها جهت شکاف اشتغال و بیکاری منطقه‌ای را نشان می‌دهد.</div>`;
}
