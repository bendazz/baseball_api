const yearInput = document.getElementById("year");
const fetchBtn = document.getElementById("fetch-btn");
const results = document.getElementById("results");

fetchBtn.addEventListener("click", async () => {
    const year = yearInput.value;
    const response = await fetch(`/teams?yearID=${year}`);
    const teams = await response.json();

    results.innerHTML = "";

    if (teams.length === 0) {
        results.innerHTML = '<p class="no-results">No teams found for this year.</p>';
        return;
    }

    const grid = document.createElement("div");
    grid.className = "team-grid";

    teams.forEach(team => {
        const card = document.createElement("div");
        card.className = "team-card";
        card.textContent = team.name;
        card.dataset.teamId = team.teamID;
        card.dataset.yearId = year;
        card.addEventListener("click", () => loadStats(team.teamID, year));
        grid.appendChild(card);
    });

    results.appendChild(grid);
});

async function loadStats(teamID, yearID) {
    const response = await fetch(`/stats?teamID=${teamID}&yearID=${yearID}`);
    const players = await response.json();

    results.innerHTML = "";

    if (players.length === 0) {
        results.innerHTML = '<p class="no-results">No batting stats found for this team.</p>';
        return;
    }

    const table = document.createElement("table");
    table.className = "stats-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Player</th>
                <th>G</th>
                <th>AB</th>
                <th>H</th>
                <th>HR</th>
                <th>RBI</th>
                <th>BB</th>
                <th>SO</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement("tbody");
    players.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="#" class="player-link" data-player-id="${p.playerID}">${p.nameFirst} ${p.nameLast}</a></td>
            <td>${p.G}</td>
            <td>${p.AB}</td>
            <td>${p.H}</td>
            <td>${p.HR}</td>
            <td>${p.RBI}</td>
            <td>${p.BB}</td>
            <td>${p.SO}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    results.appendChild(table);

    table.querySelectorAll(".player-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            loadPlayer(link.dataset.playerId, teamID, yearID);
        });
    });
}

async function loadPlayer(playerID, teamID, yearID) {
    const response = await fetch(`/player?playerID=${playerID}`);
    const player = await response.json();

    results.innerHTML = "";

    if (!player) {
        results.innerHTML = '<p class="no-results">Player not found.</p>';
        return;
    }

    const stats = player.stats || [];

    // Career totals
    const totals = { G: 0, AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, SO: 0 };
    stats.forEach(s => {
        for (const key in totals) totals[key] += s[key] || 0;
    });
    const avg = totals.AB > 0 ? (totals.H / totals.AB).toFixed(3) : ".000";

    // Bio card
    const bio = document.createElement("div");
    bio.className = "player-bio";
    bio.innerHTML = `
        <h2>${player.nameFirst} ${player.nameLast}</h2>
        <p><strong>Born:</strong> ${player.birthYear || "Unknown"} — ${player.birthCity || "Unknown"}, ${player.birthState || ""}</p>
        <p><strong>Bats:</strong> ${player.bats || "Unknown"} | <strong>Throws:</strong> ${player.throws || "Unknown"}</p>
        <p><strong>Debut:</strong> ${player.debut || "Unknown"} | <strong>Final Game:</strong> ${player.finalGame || "Unknown"}</p>
    `;
    results.appendChild(bio);

    // Summary cards
    const summaryRow = document.createElement("div");
    summaryRow.className = "summary-cards";
    const summaryStats = [
        { label: "AVG", value: avg },
        { label: "G", value: totals.G },
        { label: "HR", value: totals.HR },
        { label: "H", value: totals.H },
        { label: "RBI", value: totals.RBI },
        { label: "BB", value: totals.BB },
    ];
    summaryStats.forEach(s => {
        const card = document.createElement("div");
        card.className = "summary-card";
        card.innerHTML = `<div class="summary-value">${s.value}</div><div class="summary-label">${s.label}</div>`;
        summaryRow.appendChild(card);
    });
    results.appendChild(summaryRow);

    // Plotly charts
    if (stats.length > 0) {
        const years = stats.map(s => s.yearID);
        const hrs = stats.map(s => s.HR || 0);
        const avgs = stats.map(s => s.AB > 0 ? (s.H / s.AB) : 0);

        const hrChart = document.createElement("div");
        hrChart.className = "chart-container";
        results.appendChild(hrChart);

        Plotly.newPlot(hrChart, [{
            x: years,
            y: hrs,
            type: "bar",
            marker: { color: "#1a3a5c" },
            hovertemplate: "%{x}: %{y} HR<extra></extra>"
        }], {
            title: "Home Runs by Season",
            xaxis: { title: "Year", dtick: 1 },
            yaxis: { title: "HR" },
            height: 380,
            margin: { t: 40, b: 50, l: 50, r: 20 },
            plot_bgcolor: "#f9f9f9",
            paper_bgcolor: "#fff"
        }, { responsive: true });

        const avgChart = document.createElement("div");
        avgChart.className = "chart-container";
        results.appendChild(avgChart);

        Plotly.newPlot(avgChart, [{
            x: years,
            y: avgs,
            type: "scatter",
            mode: "lines+markers",
            line: { color: "#c8102e", width: 2 },
            marker: { size: 6 },
            hovertemplate: "%{x}: %{y:.3f}<extra></extra>"
        }], {
            title: "Batting Average by Season",
            xaxis: { title: "Year", dtick: 1 },
            yaxis: { title: "AVG", tickformat: ".3f" },
            height: 380,
            margin: { t: 40, b: 50, l: 50, r: 20 },
            plot_bgcolor: "#f9f9f9",
            paper_bgcolor: "#fff"
        }, { responsive: true });
    }

    // Year-by-year stats table
    if (stats.length > 0) {
        const table = document.createElement("table");
        table.className = "stats-table";
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Team</th>
                    <th>G</th>
                    <th>AB</th>
                    <th>H</th>
                    <th>HR</th>
                    <th>RBI</th>
                    <th>BB</th>
                    <th>SO</th>
                    <th>AVG</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement("tbody");
        stats.forEach(s => {
            const sAvg = s.AB > 0 ? (s.H / s.AB).toFixed(3) : ".000";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.yearID}</td>
                <td>${s.teamID}</td>
                <td>${s.G}</td>
                <td>${s.AB}</td>
                <td>${s.H}</td>
                <td>${s.HR}</td>
                <td>${s.RBI}</td>
                <td>${s.BB}</td>
                <td>${s.SO}</td>
                <td>${sAvg}</td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        results.appendChild(table);
    }

    // Back button
    if (teamID && yearID) {
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Back to Team";
        backBtn.className = "back-btn";
        backBtn.addEventListener("click", () => loadStats(teamID, yearID));
        results.appendChild(backBtn);
    }
}
