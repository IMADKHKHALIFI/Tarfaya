// Analytics Dashboard - Complete Visualization System
// Supports: D3.js, Three.js, Chart.js, Interactive Cards, Tables

// ============================================================================
// DATA PROCESSING
// ============================================================================

let processedData = {
    communes: [],
    province: {},
    health: {},
    education: {},
    employment: {},
    demographics: {}
};

function processData() {
    if (!DATA_JSON || !DATA_JSON.tables) {
        console.error('DATA_JSON not found');
        return;
    }

    const communes = {};

    // Helper to get or create commune
    const getCommune = (name) => {
        const key = normalizeName(name);
        if (!communes[key]) {
            communes[key] = { name: name, key: key };
        }
        return communes[key];
    };

    // Process Demographics
    const demoTable = DATA_JSON.tables.find(t => t.nom === "RENSEIGNEMENTS DEMOGRAPHIQUES");
    if (demoTable) {
        const provinceSec = demoTable.sections.find(s => s.type === "Données par province");
        if (provinceSec) {
            processedData.province.demo = provinceSec.donnees;
        }

        const communeSec = demoTable.sections.find(s => s.type === "Données par commune");
        if (communeSec && communeSec.donnees) {
            communeSec.donnees.forEach(d => {
                const c = getCommune(d["Collectivités territoriales"]);
                c.demo = d;
            });
        }
    }

    // Process Education
    const eduTable = DATA_JSON.tables.find(t => t.nom === "EDUCATION");
    if (eduTable) {
        const provinceSec = eduTable.sections.find(s => s.type.includes("PROVINCE"));
        if (provinceSec) {
            processedData.province.edu = provinceSec.donnees;
        }

        eduTable.sections.forEach(s => {
            if (s.type.toLowerCase().includes("commune")) {
                const c = getCommune(s.type);
                c.edu = s.donnees;
            }
        });
    }

    // Process Employment
    const empTable = DATA_JSON.tables.find(t => t.nom === "EMPLOI");
    if (empTable) {
        const provinceSec = empTable.sections.find(s => s.type.toLowerCase().includes("province"));
        if (provinceSec) {
            processedData.province.emp = provinceSec.donnees;
        }

        empTable.sections.forEach(s => {
            if (s.type.toLowerCase().includes("commune")) {
                const c = getCommune(s.type);
                c.emp = s.donnees;
            }
        });
    }

    // Process Health
    const santeTable = DATA_JSON.tables.find(t => t.nom === "SANTE");
    if (santeTable) {
        const provinceSec = santeTable.sections.find(s => s.type.toLowerCase().includes("province"));
        if (provinceSec) {
            processedData.province.sante = provinceSec.donnees;
        }

        const communeSec = santeTable.sections.find(s => s.type === "Données par commune");
        if (communeSec && communeSec.donnees) {
            communeSec.donnees.forEach(d => {
                const c = getCommune(d["Collectivités territoriales"]);
                c.sante = d;
            });
        }
    }

    // Process Water (EAU)
    const eauTable = DATA_JSON.tables.find(t => t.nom === "EAU");
    if (eauTable) {
        const provinceSec = eauTable.sections.find(s => s.type.toLowerCase().includes("province"));
        if (provinceSec) {
            processedData.province.eau = provinceSec.donnees;
        }

        const communeSec = eauTable.sections.find(s => s.type === "Données par commune");
        if (communeSec && communeSec.donnees) {
            communeSec.donnees.forEach(d => {
                const c = getCommune(d["Collectivités territoriales"]);
                c.eau = d;
            });
        }
    }

    processedData.communes = Object.values(communes);
    console.log('Processed Data:', processedData);
}

function normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/commune (de |d')/gi, '')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function parseNum(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        return parseFloat(val.replace(/,/g, '').replace(/%/g, '').trim()) || 0;
    }
    return 0;
}

// ============================================================================
// KPI CARDS
// ============================================================================

function createKPICards() {
    const container = document.getElementById('kpiCards');
    if (!container) return;

    const kpis = [
        {
            icon: 'fa-users',
            color: '#10b981',
            value: '16,228',
            label: 'Population',
            change: '+2.3%'
        },
        {
            icon: 'fa-graduation-cap',
            color: '#3b82f6',
            value: '3,797',
            label: 'Élèves',
            change: '+5.1%'
        },
        {
            icon: 'fa-hospital',
            color: '#ef4444',
            value: '8',
            label: 'ESSP',
            change: '0%'
        },
        {
            icon: 'fa-truck-medical',
            color: '#f97316',
            value: '10',
            label: 'Ambulances',
            change: '0%'
        },
        {
            icon: 'fa-briefcase',
            color: '#f59e0b',
            value: '46.9%',
            label: "Taux d'activité",
            change: '+1.2%'
        },
        {
            icon: 'fa-city',
            color: '#8b5cf6',
            value: '68%',
            label: 'Urbanisation',
            change: '+0.5%'
        }
    ];

    container.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
            <div class="kpi-icon" style="background: ${kpi.color}20; color: ${kpi.color};">
                <i class="fa-solid ${kpi.icon}"></i>
            </div>
            <div class="kpi-value">${kpi.value}</div>
            <div class="kpi-label">${kpi.label}</div>
            <div class="kpi-change positive">
                <i class="fa-solid fa-arrow-up"></i> ${kpi.change}
            </div>
        </div>
    `).join('');
}

// ============================================================================
// COMPARISON TABLE
// ============================================================================

function createComparisonTable() {
    const table = document.getElementById('comparisonTable');
    if (!table) return;

    const headers = ['Commune', 'Population', 'ESSP', 'Écoles', 'Taux Activité', 'Taux Chômage'];

    let html = '<thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    processedData.communes.forEach(c => {
        const pop = c.demo?.Population || '—';
        const essp = c.sante?.["Nombre d'établissements sanitaires"] || 0;
        const schools = (parseNum(c.edu?.["Nombre d'établissements préscolaires"]) +
            parseNum(c.edu?.["Nombre d'établissements Primaire"]) +
            parseNum(c.edu?.["Nombre d'établissements collège"]) +
            parseNum(c.edu?.["Nombre d'établissements Lycée"])) || 0;
        const activity = c.emp?.["Taux d'activité des 15 ans et plus (%)"] || '—';
        const unemployment = c.emp?.["Taux de chômage (%)"] || '—';

        html += `
            <tr>
                <td class="commune-name">${c.name}</td>
                <td class="metric-value">${pop}</td>
                <td class="metric-value ${essp > 1 ? 'metric-high' : 'metric-low'}">${essp}</td>
                <td class="metric-value">${schools}</td>
                <td class="metric-value">${activity}${typeof activity === 'number' ? '%' : ''}</td>
                <td class="metric-value">${unemployment}${typeof unemployment === 'number' ? '%' : ''}</td>
            </tr>
        `;
    });

    html += '</tbody>';
    table.innerHTML = html;
}

// ============================================================================
// D3.JS VISUALIZATIONS
// ============================================================================

// Performance Matrix Heatmap
function createPerformanceMatrix() {
    const container = d3.select('#performanceMatrix');
    if (container.empty()) return;

    container.html(''); // Clear

    const metrics = ['Population', 'Santé', 'Éducation', 'Emploi'];
    const communes = processedData.communes.map(c => c.name.replace(/Commune (de |d')/i, ''));

    const data = processedData.communes.map((c, i) => {
        return metrics.map((m, j) => {
            let value = 0;
            if (m === 'Population') value = parseNum(c.demo?.Population) / 100;
            else if (m === 'Santé') value = parseNum(c.sante?.["Nombre d'établissements sanitaires"]) * 20;
            else if (m === 'Éducation') value = (parseNum(c.edu?.["Nombre d'établissements préscolaires"]) +
                parseNum(c.edu?.["Nombre d'établissements Primaire"])) * 10;
            else if (m === 'Emploi') value = parseNum(c.emp?.["Taux d'activité des 15 ans et plus (%)"]);

            return { commune: communes[i], metric: m, value: value, row: i, col: j };
        });
    }).flat();

    const margin = { top: 60, right: 20, bottom: 60, left: 120 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(metrics)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(communes)
        .range([0, height])
        .padding(0.05);

    const color = d3.scaleSequential()
        .domain([0, d3.max(data, d => d.value)])
        .interpolator(d3.interpolateBlues);

    // Add cells
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.metric))
        .attr('y', d => y(d.commune))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', d => color(d.value))
        .attr('class', 'heatmap-cell')
        .on('mouseover', function (event, d) {
            showTooltip(event, `
                <div class="d3-tooltip-title">${d.commune}</div>
                <div class="d3-tooltip-content">
                    <div class="d3-tooltip-row">
                        <span class="d3-tooltip-label">${d.metric}:</span>
                        <span class="d3-tooltip-value">${d.value.toFixed(1)}</span>
                    </div>
                </div>
            `);
        })
        .on('mouseout', hideTooltip);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');
}

// Priority Index Bar Chart
function createPriorityIndex() {
    const container = d3.select('#priorityIndex');
    if (container.empty()) return;

    container.html('');

    const data = processedData.communes.map(c => {
        const healthScore = parseNum(c.sante?.["Nombre d'établissements sanitaires"]) * 20;
        const eduScore = (parseNum(c.edu?.["Nombre d'établissements préscolaires"]) +
            parseNum(c.edu?.["Nombre d'établissements Primaire"])) * 5;
        const empScore = parseNum(c.emp?.["Taux d'activité des 15 ans et plus (%)"]);
        const totalScore = healthScore + eduScore + empScore;

        return {
            commune: c.name.replace(/Commune (de |d')/i, ''),
            score: totalScore,
            priority: totalScore < 100 ? 'Haute' : totalScore < 150 ? 'Moyenne' : 'Basse'
        };
    }).sort((a, b) => a.score - b.score);

    const margin = { top: 20, right: 20, bottom: 60, left: 120 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.score)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.commune))
        .range([0, height])
        .padding(0.2);

    const colorScale = d3.scaleOrdinal()
        .domain(['Haute', 'Moyenne', 'Basse'])
        .range(['#ef4444', '#f59e0b', '#10b981']);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', d => y(d.commune))
        .attr('width', d => x(d.score))
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(d.priority))
        .attr('class', 'bar')
        .on('mouseover', function (event, d) {
            showTooltip(event, `
                <div class="d3-tooltip-title">${d.commune}</div>
                <div class="d3-tooltip-content">
                    <div class="d3-tooltip-row">
                        <span class="d3-tooltip-label">Score:</span>
                        <span class="d3-tooltip-value">${d.score.toFixed(0)}</span>
                    </div>
                    <div class="d3-tooltip-row">
                        <span class="d3-tooltip-label">Priorité:</span>
                        <span class="d3-tooltip-value">${d.priority}</span>
                    </div>
                </div>
            `);
        })
        .on('mouseout', hideTooltip);

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff');
}

// Health Infrastructure Bar Chart
function createHealthInfraChart() {
    const container = d3.select('#healthInfraChart');
    if (container.empty()) return;

    container.html('');

    const data = processedData.communes.map(c => ({
        commune: c.name.replace(/Commune (de |d')/i, ''),
        essp: parseNum(c.sante?.["Nombre d'établissements sanitaires"]),
        ambulances: parseNum(c.sante?.["Nombre d'ambulances"])
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
        .domain(data.map(d => d.commune))
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(['essp', 'ambulances'])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.essp, d.ambulances))])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(['essp', 'ambulances'])
        .range(['#ef4444', '#f97316']);

    const groups = svg.selectAll('g.commune')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'commune')
        .attr('transform', d => `translate(${x0(d.commune)},0)`);

    groups.selectAll('rect')
        .data(d => ['essp', 'ambulances'].map(key => ({ key, value: d[key], commune: d.commune })))
        .enter()
        .append('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', d => color(d.key))
        .attr('class', 'bar');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .style('fill', '#fff')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, 0)`);

    ['essp', 'ambulances'].forEach((key, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

        g.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', color(key));

        g.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .text(key === 'essp' ? 'ESSP' : 'Ambulances')
            .style('fill', '#fff')
            .style('font-size', '11px');
    });
}

// Medical Staff Stacked Bar
function createMedicalStaffChart() {
    const container = d3.select('#medicalStaffChart');
    if (container.empty()) return;

    container.html('');

    const data = processedData.communes.map(c => ({
        commune: c.name.replace(/Commune (de |d')/i, ''),
        medecins: parseNum(c.sante?.["Nombre de médcin"]),
        infirmiers: parseNum(c.sante?.["Nombre d'infirmier"]),
        sagesFemmes: parseNum(c.sante?.["Nombre de sage femme"])
    }));

    const margin = { top: 20, right: 100, bottom: 60, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const keys = ['medecins', 'infirmiers', 'sagesFemmes'];
    const stack = d3.stack().keys(keys);
    const series = stack(data);

    const x = d3.scaleBand()
        .domain(data.map(d => d.commune))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(['#3b82f6', '#10b981', '#ec4899']);

    svg.selectAll('g.series')
        .data(series)
        .enter()
        .append('g')
        .attr('class', 'series')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => x(d.data.commune))
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('class', 'bar');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width + 10}, 0)`);

    const labels = { medecins: 'Médecins', infirmiers: 'Infirmiers', sagesFemmes: 'Sages-femmes' };
    keys.forEach((key, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

        g.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', color(key));

        g.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .text(labels[key])
            .style('fill', '#fff')
            .style('font-size', '10px');
    });
}

// School Distribution Chart
function createSchoolDistChart() {
    const container = d3.select('#schoolDistChart');
    if (container.empty()) return;

    container.html('');

    const data = processedData.communes.map(c => ({
        commune: c.name.replace(/Commune (de |d')/i, ''),
        prescolaire: parseNum(c.edu?.["Nombre d'établissements préscolaires"]),
        primaire: parseNum(c.edu?.["Nombre d'établissements Primaire"]),
        college: parseNum(c.edu?.["Nombre d'établissements collège"]),
        lycee: parseNum(c.edu?.["Nombre d'établissements Lycée"])
    }));

    const margin = { top: 20, right: 100, bottom: 60, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const keys = ['prescolaire', 'primaire', 'college', 'lycee'];
    const stack = d3.stack().keys(keys);
    const series = stack(data);

    const x = d3.scaleBand()
        .domain(data.map(d => d.commune))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(['#a78bfa', '#60a5fa', '#34d399', '#fbbf24']);

    svg.selectAll('g.series')
        .data(series)
        .enter()
        .append('g')
        .attr('class', 'series')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => x(d.data.commune))
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('class', 'bar');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');

    // Add Legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + 20}, 0)`);

    const legendData = [
        { key: 'prescolaire', label: 'Préscolaire', color: '#a78bfa' },
        { key: 'primaire', label: 'Primaire', color: '#60a5fa' },
        { key: 'college', label: 'Collège', color: '#34d399' },
        { key: 'lycee', label: 'Lycée', color: '#fbbf24' }
    ];

    const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', d => d.color)
        .attr('rx', 3);

    legendItems.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .text(d => d.label);
}

// Enrollment Area Chart
function createEnrollmentChart() {
    const container = d3.select('#enrollmentChart');
    if (container.empty()) return;

    container.html('');

    const levels = ['Préscolaire', 'Primaire', 'Collège', 'Lycée'];
    const data = levels.map((level, i) => {
        let total = 0;
        processedData.communes.forEach(c => {
            if (i === 0) total += parseNum(c.edu?.["Nombre des élèves Préscolaire -Fille-"]) + parseNum(c.edu?.["Nombre des élèves Préscolaire -Garçon-"]);
            else if (i === 1) total += parseNum(c.edu?.["Nombre des élèves Primaire -Fille-"]) + parseNum(c.edu?.["Nombre des élèves Primaire -Garçon-"]);
            else if (i === 2) total += parseNum(c.edu?.["Nombre des élèves collège -Fille-"]) + parseNum(c.edu?.["Nombre des élèves collège -Garçon-"]);
            else if (i === 3) total += parseNum(c.edu?.["Nombre des élèves Lycée -Fille-"]) + parseNum(c.edu?.["Nombre des élèves Lycée -Garçon-"]);
        });
        return { level, total, index: i };
    });

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
        .domain(data.map(d => d.level))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .nice()
        .range([height, 0]);

    const area = d3.area()
        .x(d => x(d.level))
        .y0(height)
        .y1(d => y(d.total))
        .curve(d3.curveMonotoneX);

    const line = d3.line()
        .x(d => x(d.level))
        .y(d => y(d.total))
        .curve(d3.curveMonotoneX);

    svg.append('path')
        .datum(data)
        .attr('fill', 'url(#areaGradient)')
        .attr('d', area);

    svg.append('defs')
        .append('linearGradient')
        .attr('id', 'areaGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
            { offset: '0%', color: '#3b82f6', opacity: 0.6 },
            { offset: '100%', color: '#3b82f6', opacity: 0.1 }
        ])
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity);

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('d', line);

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.level))
        .attr('cy', d => y(d.total))
        .attr('r', 4)
        .attr('fill', '#3b82f6')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');
}

// Health Coverage Heatmap
function createHealthHeatmap() {
    const container = d3.select('#healthHeatmap');
    if (container.empty()) return;

    container.html('');

    const metrics = ['ESSP', 'Médecins', 'Infirmiers', 'Ambulances', 'Lits'];
    const data = processedData.communes.map(c => {
        return {
            commune: c.name.replace(/Commune (de |d')/i, ''),
            values: [
                parseNum(c.sante?.["Nombre d'établissements sanitaires"]),
                parseNum(c.sante?.["Nombre de médcin"]),
                parseNum(c.sante?.["Nombre d'infirmier"]),
                parseNum(c.sante?.["Nombre d'ambulances"]),
                parseNum(c.sante?.["Nombre lit accouchement"])
            ]
        };
    });

    const flatData = data.flatMap(d =>
        metrics.map((m, i) => ({ commune: d.commune, metric: m, value: d.values[i] }))
    );

    const margin = { top: 60, right: 20, bottom: 60, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(metrics)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(data.map(d => d.commune))
        .range([0, height])
        .padding(0.05);

    const color = d3.scaleSequential()
        .domain([0, d3.max(flatData, d => d.value)])
        .interpolator(d3.interpolateReds);

    svg.selectAll('rect')
        .data(flatData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.metric))
        .attr('y', d => y(d.commune))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', d => color(d.value))
        .attr('class', 'heatmap-cell')
        .on('mouseover', function (event, d) {
            showTooltip(event, `
                <div class="d3-tooltip-title">${d.commune}</div>
                <div class="d3-tooltip-content">
                    <div class="d3-tooltip-row">
                        <span class="d3-tooltip-label">${d.metric}:</span>
                        <span class="d3-tooltip-value">${d.value}</span>
                    </div>
                </div>
            `);
        })
        .on('mouseout', hideTooltip);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');
}

// Employment Heatmap
function createEmploymentHeatmap() {
    const container = d3.select('#employmentHeatmap');
    if (container.empty()) return;

    container.html('');

    const metrics = ["Taux d'activité", 'Taux de chômage', 'Pop. active'];
    const data = processedData.communes.map(c => {
        return {
            commune: c.name.replace(/Commune (de |d')/i, ''),
            values: [
                parseNum(c.emp?.["Taux d'activité des 15 ans et plus (%)"]),
                parseNum(c.emp?.["Taux de chômage (%)"]),
                parseNum(c.emp?.["Population active occupée de 15 ans et plus"]) / 100
            ]
        };
    });

    const flatData = data.flatMap(d =>
        metrics.map((m, i) => ({ commune: d.commune, metric: m, value: d.values[i] }))
    );

    const margin = { top: 60, right: 20, bottom: 60, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(metrics)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(data.map(d => d.commune))
        .range([0, height])
        .padding(0.05);

    const color = d3.scaleSequential()
        .domain([0, d3.max(flatData, d => d.value)])
        .interpolator(d3.interpolateOranges);

    svg.selectAll('rect')
        .data(flatData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.metric))
        .attr('y', d => y(d.commune))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', d => color(d.value))
        .attr('class', 'heatmap-cell');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff')
        .attr('transform', 'rotate(-15)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');
}

// Gender Parity Gauges
function createGenderParityChart() {
    const container = d3.select('#genderParityChart');
    if (container.empty()) return;

    container.html('');

    const levels = ['Préscolaire', 'Primaire', 'Collège', 'Lycée'];
    const data = levels.map((level, i) => {
        let filles = 0, garcons = 0;
        processedData.communes.forEach(c => {
            if (i === 0) {
                filles += parseNum(c.edu?.["Nombre des élèves Préscolaire -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves Préscolaire -Garçon-"]);
            } else if (i === 1) {
                filles += parseNum(c.edu?.["Nombre des élèves Primaire -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves Primaire -Garçon-"]);
            } else if (i === 2) {
                filles += parseNum(c.edu?.["Nombre des élèves collège -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves collège -Garçon-"]);
            } else if (i === 3) {
                filles += parseNum(c.edu?.["Nombre des élèves Lycée -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves Lycée -Garçon-"]);
            }
        });
        const ratio = garcons > 0 ? (filles / garcons) : 0;
        return { level, filles, garcons, ratio };
    });

    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.level))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, 1.5])
        .range([height, 0]);

    const colorScale = d3.scaleLinear()
        .domain([0.8, 1, 1.2])
        .range(['#ef4444', '#10b981', '#ef4444']);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.level))
        .attr('y', d => y(d.ratio))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.ratio))
        .attr('fill', d => colorScale(d.ratio))
        .attr('class', 'bar');

    // Add parity line at 1.0
    svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(1))
        .attr('y2', y(1))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');
}

// Education Pyramid
function createEducationPyramid() {
    const container = d3.select('#educationPyramid');
    if (container.empty()) return;

    container.html('');

    const levels = ['Préscolaire', 'Primaire', 'Collège', 'Lycée'];
    const data = levels.map((level, i) => {
        let filles = 0, garcons = 0;
        processedData.communes.forEach(c => {
            if (i === 0) {
                filles += parseNum(c.edu?.["Nombre des élèves Préscolaire -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves Préscolaire -Garçon-"]);
            } else if (i === 1) {
                filles += parseNum(c.edu?.["Nombre des élèves Primaire -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves Primaire -Garçon-"]);
            } else if (i === 2) {
                filles += parseNum(c.edu?.["Nombre des élèves collège -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves collège -Garçon-"]);
            } else if (i === 3) {
                filles += parseNum(c.edu?.["Nombre des élèves Lycée -Fille-"]);
                garcons += parseNum(c.edu?.["Nombre des élèves Lycée -Garçon-"]);
            }
        });
        return { level, filles: -filles, garcons };
    });

    const margin = { top: 20, right: 40, bottom: 60, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(data, d => Math.max(Math.abs(d.filles), d.garcons));

    const x = d3.scaleLinear()
        .domain([-maxValue, maxValue])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.level))
        .range([0, height])
        .padding(0.2);

    // Filles (left side)
    svg.selectAll('.bar-filles')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar-filles')
        .attr('x', d => x(d.filles))
        .attr('y', d => y(d.level))
        .attr('width', d => x(0) - x(d.filles))
        .attr('height', y.bandwidth())
        .attr('fill', '#ec4899');

    // Garçons (right side)
    svg.selectAll('.bar-garcons')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar-garcons')
        .attr('x', x(0))
        .attr('y', d => y(d.level))
        .attr('width', d => x(d.garcons) - x(0))
        .attr('height', y.bandwidth())
        .attr('fill', '#3b82f6');

    // Center line
    svg.append('line')
        .attr('x1', x(0))
        .attr('x2', x(0))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => Math.abs(d)))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .attr('transform', `translate(${x(0)},0)`)
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, 10)`);

    legend.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', '#ec4899');
    legend.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .text('Filles')
        .style('fill', '#fff')
        .style('font-size', '11px');

    legend.append('rect')
        .attr('y', 20)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', '#3b82f6');
    legend.append('text')
        .attr('x', 18)
        .attr('y', 30)
        .text('Garçons')
        .style('fill', '#fff')
        .style('font-size', '11px');
}

// Population Treemap
function createPopulationTreemap() {
    const container = d3.select('#populationTreemap');
    if (container.empty()) return;

    container.html('');

    const data = {
        name: 'Tarfaya',
        children: processedData.communes.map(c => ({
            name: c.name.replace(/Commune (de |d')/i, ''),
            value: parseNum(c.demo?.Population)
        }))
    };

    const width = 500;
    const height = 300;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .padding(2)
        (root);

    const color = d3.scaleOrdinal()
        .domain(data.children.map(d => d.name))
        .range(['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']);

    const leaf = svg.selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    leaf.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => color(d.data.name))
        .attr('opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    leaf.append('text')
        .attr('x', 5)
        .attr('y', 20)
        .text(d => d.data.name)
        .style('fill', '#fff')
        .style('font-size', '12px')
        .style('font-weight', '600');

    leaf.append('text')
        .attr('x', 5)
        .attr('y', 40)
        .text(d => d.data.value.toLocaleString())
        .style('fill', '#fff')
        .style('font-size', '14px')
        .style('font-weight', '700');
}

// Gender Distribution Pie Charts
function createGenderDistChart() {
    const container = d3.select('#genderDistChart');
    if (container.empty()) return;

    container.html('');

    const width = 500;
    const height = 300;
    const radius = 40;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    const communes = processedData.communes.slice(0, 5);
    const cols = 3;
    const rows = Math.ceil(communes.length / cols);

    communes.forEach((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = (width / cols) * col + (width / cols) / 2;
        const cy = (height / rows) * row + (height / rows) / 2;

        const masculin = parseNum(c.demo?.Masculin);
        const feminin = parseNum(c.demo?.Féminin);
        const total = masculin + feminin;

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const data = [
            { label: 'Hommes', value: masculin, color: '#3b82f6' },
            { label: 'Femmes', value: feminin, color: '#ec4899' }
        ];

        const g = svg.append('g')
            .attr('transform', `translate(${cx},${cy})`);

        g.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        g.append('text')
            .attr('y', radius + 20)
            .attr('text-anchor', 'middle')
            .text(c.name.replace(/Commune (de |d')/i, ''))
            .style('fill', '#fff')
            .style('font-size', '10px');
    });
}

// Correlation Scatter Plot
function createCorrelationChart() {
    const container = d3.select('#correlationChart');
    if (container.empty()) return;

    container.html('');

    const data = processedData.communes.map(c => {
        const schools = (parseNum(c.edu?.["Nombre d'établissements préscolaires"]) +
            parseNum(c.edu?.["Nombre d'établissements Primaire"]) +
            parseNum(c.edu?.["Nombre d'établissements collège"]) +
            parseNum(c.edu?.["Nombre d'établissements Lycée"]));
        const pop = parseNum(c.demo?.Population);
        const schoolsPerCapita = pop > 0 ? (schools / pop) * 10000 : 0;
        const activityRate = parseNum(c.emp?.["Taux d'activité des 15 ans et plus (%)"]);

        return {
            commune: c.name.replace(/Commune (de |d')/i, ''),
            education: schoolsPerCapita,
            employment: activityRate,
            population: pop
        };
    });

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.education)])
        .nice()
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.employment)])
        .nice()
        .range([height, 0]);

    const size = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.population)])
        .range([5, 30]);

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.education))
        .attr('cy', d => y(d.employment))
        .attr('r', d => size(d.population))
        .attr('fill', '#8b5cf6')
        .attr('opacity', 0.6)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#fff');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('text-anchor', 'middle')
        .text('Écoles pour 10k hab.')
        .style('fill', '#fff')
        .style('font-size', '12px');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .text("Taux d'activité (%)")
        .style('fill', '#fff')
        .style('font-size', '12px');
}

// ============================================================================
// CHART.JS VISUALIZATIONS
// ============================================================================

function createHealthRadarChart() {
    const canvas = document.getElementById('healthRadarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Couverture ESSP', 'Ambulances', 'Personnel', 'Naissances surveillées', 'Mortalité'],
            datasets: [{
                label: 'Province de Tarfaya',
                data: [80, 75, 65, 25, 98],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                borderWidth: 2,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#ef4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#fff', font: { size: 11 } }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

function createEmploymentRatesChart() {
    const canvas = document.getElementById('employmentRatesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const communes = processedData.communes.map(c => c.name.replace(/Commune (de |d')/i, ''));
    const activityRates = processedData.communes.map(c => parseNum(c.emp?.["Taux d'activité des 15 ans et plus (%)"]));
    const unemploymentRates = processedData.communes.map(c => parseNum(c.emp?.["Taux de chômage (%)"]));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: communes,
            datasets: [
                {
                    label: "Taux d'activité",
                    data: activityRates,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Taux de chômage',
                    data: unemploymentRates,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

function createActivePopChart() {
    const canvas = document.getElementById('activePopChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const totalActive = processedData.communes.reduce((sum, c) =>
        sum + parseNum(c.emp?.["Population active occupée de 15 ans et plus"]), 0);
    const avgUnemployment = processedData.communes.reduce((sum, c) =>
        sum + parseNum(c.emp?.["Taux de chômage (%)"]), 0) / processedData.communes.length;

    const employed = totalActive;
    const unemployed = Math.round(totalActive * (avgUnemployment / 100));

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Employés', 'Chômeurs'],
            datasets: [{
                data: [employed, unemployed],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#fff', padding: 15 }
                }
            }
        }
    });
}

function createDensityChart() {
    const canvas = document.getElementById('densityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const communes = processedData.communes.map(c => c.name.replace(/Commune (de |d')/i, ''));
    const densities = processedData.communes.map(c => {
        const pop = parseNum(c.demo?.Population);
        const area = parseNum(c.demo?.["Superficie (Km²)"]);
        return area > 0 ? (pop / area).toFixed(2) : 0;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes,
            datasets: [{
                label: 'Densité (hab/km²)',
                data: densities,
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

function createHouseholdChart() {
    const canvas = document.getElementById('householdChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const communes = processedData.communes.map(c => c.name.replace(/Commune (de |d')/i, ''));
    const households = processedData.communes.map(c => parseNum(c.demo?.["Nombre ménage"]));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes,
            datasets: [{
                label: 'Nombre de ménages',
                data: households,
                backgroundColor: '#f97316',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: { color: 'rgba(255,255,255,0.6)' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

// ============================================================================
// THREE.JS 3D VISUALIZATION
// ============================================================================

let scene, camera, renderer, controls;
let current3DLayer = 'health';
let barMeshes = [];

function init3DVisualization() {
    const container = document.getElementById('threejs-container');
    if (!container) {
        console.error('3D container not found');
        return;
    }

    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        console.error('THREE.js not loaded');
        container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">Erreur: THREE.js non chargé</div>';
        return;
    }

    console.log('Initializing 3D visualization...');

    // Clear container
    container.innerHTML = '';

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 50, 200);

    // Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 40, 30);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 0.5);
    pointLight.position.set(-20, 30, -20);
    scene.add(pointLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b);
    scene.add(gridHelper);

    // Create 3D bars for communes
    create3DBars(current3DLayer);

    // Controls - check if OrbitControls is available
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 20;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2;
        console.log('OrbitControls initialized');
    } else {
        console.warn('OrbitControls not available - using basic camera');
    }

    // Setup layer toggle buttons
    setup3DLayerToggles();

    // Animation loop
    animate3D();

    // Handle resize
    window.addEventListener('resize', onWindowResize3D);

    console.log('3D visualization initialized successfully');
}

function create3DBars(layer) {
    // Remove existing bars
    barMeshes.forEach(mesh => scene.remove(mesh));
    barMeshes = [];

    const communes = processedData.communes;
    const positions = [
        { x: -15, z: -15 },  // Tarfaya
        { x: 15, z: -15 },   // Daoura
        { x: -15, z: 15 },   // El Hagounia
        { x: 15, z: 15 },    // Akhfennir
        { x: 0, z: 0 }       // Tah (center)
    ];

    communes.forEach((commune, i) => {
        if (i >= positions.length) return;

        let value = 0;
        let color = 0x3b82f6;
        let label = '';

        if (layer === 'health') {
            value = parseNum(commune.sante?.["Nombre d'établissements sanitaires"]) || 1;
            color = 0xef4444;
            label = 'ESSP';
        } else if (layer === 'education') {
            value = (parseNum(commune.edu?.["Nombre d'établissements préscolaires"]) +
                parseNum(commune.edu?.["Nombre d'établissements Primaire"]) +
                parseNum(commune.edu?.["Nombre d'établissements collège"]) +
                parseNum(commune.edu?.["Nombre d'établissements Lycée"])) || 1;
            color = 0x3b82f6;
            label = 'Écoles';
        } else if (layer === 'employment') {
            value = parseNum(commune.emp?.["Taux d'activité des 15 ans et plus (%)"]) / 10 || 1;
            color = 0xf97316;
            label = 'Activité';
        }

        const height = value * 2;
        const geometry = new THREE.BoxGeometry(4, height, 4);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.5,
            emissive: color,
            emissiveIntensity: 0.2
        });

        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(positions[i].x, height / 2, positions[i].z);
        bar.castShadow = true;
        bar.receiveShadow = true;
        bar.userData = {
            commune: commune.name.replace(/Commune (de |d')/i, ''),
            value: value,
            label: label
        };

        scene.add(bar);
        barMeshes.push(bar);

        // Add label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        context.fillStyle = '#ffffff';
        context.font = 'Bold 24px Inter';
        context.textAlign = 'center';
        context.fillText(commune.name.replace(/Commune (de |d')/i, ''), 128, 40);
        context.font = '20px Inter';
        context.fillText(`${value.toFixed(1)} ${label}`, 128, 80);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(positions[i].x, height + 3, positions[i].z);
        sprite.scale.set(8, 4, 1);
        scene.add(sprite);
        barMeshes.push(sprite);

        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(4.2, height + 0.2, 4.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(bar.position);
        scene.add(glow);
        barMeshes.push(glow);
    });
}

function setup3DLayerToggles() {
    const toggles = document.querySelectorAll('.layer-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const layer = toggle.dataset.layer;
            current3DLayer = layer;

            toggles.forEach(t => t.classList.remove('active'));
            toggle.classList.add('active');

            create3DBars(layer);
        });
    });
}

function animate3D() {
    requestAnimationFrame(animate3D);

    // Rotate bars slightly
    barMeshes.forEach((mesh, i) => {
        if (mesh.geometry && mesh.geometry.type === 'BoxGeometry') {
            mesh.rotation.y += 0.002;
        }
    });

    if (controls) controls.update();
    renderer.render(scene, camera);
}

function onWindowResize3D() {
    const container = document.getElementById('threejs-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ============================================================================
// TOOLTIP SYSTEM
// ============================================================================

let tooltip = null;

function createTooltip() {
    tooltip = d3.select('body')
        .append('div')
        .attr('class', 'd3-tooltip');
}

function showTooltip(event, html) {
    if (!tooltip) createTooltip();

    tooltip
        .html(html)
        .classed('show', true)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}

function hideTooltip() {
    if (tooltip) {
        tooltip.classed('show', false);
    }
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================

function setupTabs() {
    const tabs = document.querySelectorAll('.sector-tab');
    const contents = document.querySelectorAll('.sector-content');

    console.log('[setupTabs] Found', tabs.length, 'tabs and', contents.length, 'content sections');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const sector = tab.dataset.sector;
            console.log('[setupTabs] Tab clicked:', sector);

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(c => c.classList.remove('active'));
            const targetContent = document.getElementById(`${sector}-section`);
            console.log('[setupTabs] Target section:', `${sector}-section`, 'Found:', !!targetContent);

            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Analytics Dashboard Loading...');

    // Process data
    processData();

    // Create visualizations
    createKPICards();
    createComparisonTable();

    // D3.js charts - Overview
    createPerformanceMatrix();
    createPriorityIndex();

    // D3.js charts - Health
    createHealthInfraChart();
    createMedicalStaffChart();
    createHealthHeatmap();

    // D3.js charts - Education
    createSchoolDistChart();
    createEnrollmentChart();
    createGenderParityChart();
    createEducationPyramid();

    // D3.js charts - Employment
    createEmploymentHeatmap();
    createCorrelationChart();

    // D3.js charts - Demographics
    createPopulationTreemap();
    createGenderDistChart();

    // Chart.js charts
    createHealthRadarChart();
    createEmploymentRatesChart();
    createActivePopChart();
    createDensityChart();
    createHouseholdChart();

    // Water Analytics
    createWaterInfraChart();
    createWaterPerformanceChart();
    createWaterConnectionChart();
    createWaterSanitationChart();

    // Three.js 3D Visualization
    // init3DVisualization();

    // Setup interactivity
    setupTabs();
    createTooltip();

    console.log('Analytics Dashboard Loaded!');
});
// ==================== WATER ANALYTICS ====================

function createWaterInfraChart() {
    const ctx = document.getElementById('waterInfraChart');
    if (!ctx) return;

    const communes = processedData.communes.map(c => c.name);
    const stations = processedData.communes.map(c => c.eau?.["Infrastructure Production EP"] || 0);
    const branchements = processedData.communes.map(c => c.eau?.["Nombre de branchement EP"] || 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes,
            datasets: [
                {
                    label: 'Stations EP',
                    data: stations,
                    backgroundColor: 'rgba(6, 182, 212, 0.7)',
                    borderColor: 'rgba(6, 182, 212, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Branchements (÷100)',
                    data: branchements.map(b => Math.round(b / 100)),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.datasetIndex === 1) {
                                // Show actual branchements value
                                label += (context.parsed.y * 100).toLocaleString();
                            } else {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}

function createWaterPerformanceChart() {
    const ctx = document.getElementById('waterPerformanceChart');
    if (!ctx) return;

    const communes = processedData.communes.map(c => c.name);
    const capacities = processedData.communes.map(c => {
        const cap = c.eau?.["Capacité de production"] || "0 l/s";
        return parseFloat(cap.toString().replace(/[^\d.]/g, '')) || 0;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes,
            datasets: [
                {
                    label: 'Capacité (l/s)',
                    data: capacities,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Capacité: ${context.parsed.y} l/s`;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    title: {
                        display: true,
                        text: 'Litres par seconde (l/s)',
                        color: '#fff'
                    }
                }
            }
        }
    });
}

function createWaterConnectionChart() {
    const ctx = document.getElementById('waterConnectionChart');
    if (!ctx) return;

    const communes = processedData.communes.map(c => c.name);
    const branchements = processedData.communes.map(c => c.eau?.["Nombre de branchement EP"] || 0);
    const raccordements = processedData.communes.map(c => c.eau?.["Nombre de raccordement aux réseaux publics"] || 0);
    const tauxRaccordement = communes.map((c, i) =>
        branchements[i] > 0 ? ((raccordements[i] / branchements[i]) * 100).toFixed(1) : 0
    );

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: communes,
            datasets: [
                {
                    label: 'Taux de Raccordement (%)',
                    data: tauxRaccordement,
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    borderColor: 'rgba(168, 85, 247, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

function createWaterDecisionMatrixOld() {
    const container = document.getElementById('waterDecisionMatrix');
    if (!container) return;



    // Calculate priority scores for each commune
    const priorities = processedData.communes.map(commune => {
        const eau = commune.eau || {};
        const branchements = eau["Nombre de branchement EP"] || 0;
        const raccordements = eau["Nombre de raccordement aux réseaux publics"] || 0;
        const couverture = parseFloat(eau["Taux de couverture en assainissement"] || "0%");
        const rendementProd = parseFloat(eau["Taux de rendement infrastructure production EP"] || "0%");
        const rendementDist = parseFloat(eau["Taux de rendement infrastructure distribution EP"] || "0%");

        // Calculate connection rate
        const tauxRaccordement = branchements > 0 ? (raccordements / branchements) * 100 : 0;

        // Priority score (lower is higher priority)
        // Prioritize communes with low coverage, low connection rate, or low efficiency
        const priorityScore = (
            (100 - couverture) * 0.4 +
            (100 - tauxRaccordement) * 0.3 +
            (100 - rendementDist) * 0.2 +
            (100 - rendementProd) * 0.1
        );

        return {
            commune: commune.name,
            priorityScore,
            couverture,
            tauxRaccordement,
            rendementDist,
            rendementProd,
            recommendation: priorityScore > 40 ? '🔴 Urgent' : priorityScore > 25 ? '🟡 Moyen' : '🟢 Bon'
        };
    });

    // Sort by priority (highest score = highest priority)
    priorities.sort((a, b) => b.priorityScore - a.priorityScore);

    // Create decision matrix HTML
    const html = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-white">
                <thead class="text-xs uppercase bg-white/5 border-b border-white/10">
                    <tr>
                        <th class="px-4 py-3 text-left">Commune</th>
                        <th class="px-4 py-3 text-center">Couverture</th>
                        <th class="px-4 py-3 text-center">Raccordement</th>
                        <th class="px-4 py-3 text-center">Rendement</th>
                        <th class="px-4 py-3 text-center">Priorité</th>
                    </tr>
                </thead>
                <tbody>
                    ${priorities.map(p => `
                        <tr class="border-b border-white/5 hover:bg-white/5 transition">
                            <td class="px-4 py-3 font-medium">${p.commune}</td>
                            <td class="px-4 py-3 text-center">${p.couverture.toFixed(1)}%</td>
                            <td class="px-4 py-3 text-center">${p.tauxRaccordement.toFixed(1)}%</td>
                            <td class="px-4 py-3 text-center">${p.rendementDist.toFixed(1)}%</td>
                            <td class="px-4 py-3 text-center font-semibold">${p.recommendation}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div class="text-blue-300 text-xs font-semibold mb-1">💡 Recommandations</div>
            <div class="text-white/80 text-xs">
                <strong>${priorities[0].commune}</strong> nécessite une attention prioritaire avec un score de ${priorities[0].priorityScore.toFixed(1)}/100.
                Focus sur l'amélioration de la couverture (${priorities[0].couverture.toFixed(1)}%) et du taux de raccordement (${priorities[0].tauxRaccordement.toFixed(1)}%).
            </div>
        </div>
    `;

    container.innerHTML = html;
}


// Replacement for createWaterDecisionMatrix - Sanitation Coverage Chart
function createWaterSanitationChart() {
    const ctx = document.getElementById('waterDecisionMatrix');
    if (!ctx) return;

    // Check if we already have a chart instance and destroy it
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    // Ensure we have data
    if (!processedData || !processedData.communes) return;

    const communes = processedData.communes.map(c => c.name);
    const couverture = processedData.communes.map(c => {
        const cov = c.eau?.["Taux de couverture en assainissement"] || "0%";
        return parseFloat(cov.toString().replace(/%/g, '')) || 0;
    });

    // Generate colors for each commune
    const colors = [
        'rgba(239, 68, 68, 0.8)',   // red
        'rgba(249, 115, 22, 0.8)',  // orange
        'rgba(34, 197, 94, 0.8)',   // green
        'rgba(59, 130, 246, 0.8)',  // blue
        'rgba(168, 85, 247, 0.8)'   // purple
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: communes,
            datasets: [{
                label: 'Couverture (%)',
                data: couverture,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    });
}
