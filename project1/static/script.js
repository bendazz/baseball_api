const yearInput = document.getElementById("year");
const fetchBtn = document.getElementById("fetch-btn");
const results = document.getElementById("results");

const leagueNames = {
    AL: "American League",
    NL: "National League",
};

const divisionNames = {
    E: "East",
    C: "Central",
    W: "West",
};

fetchBtn.addEventListener("click", async () => {
    const year = yearInput.value;
    const response = await fetch(`/teams?yearID=${year}`);
    const teams = await response.json();

    results.innerHTML = "";

    if (teams.length === 0) {
        results.innerHTML = '<p class="no-results">No teams found for this year.</p>';
        return;
    }

    // Group teams by league, then by division
    const grouped = {};
    teams.forEach(team => {
        const lg = team.lgID || "Other";
        const div = team.divID || "";
        if (!grouped[lg]) grouped[lg] = {};
        if (!grouped[lg][div]) grouped[lg][div] = [];
        grouped[lg][div].push({ name: team.name, W: team.W, L: team.L });
    });

    // Sort leagues: AL and NL first, then others alphabetically
    const leagueOrder = Object.keys(grouped).sort((a, b) => {
        const priority = { AL: 0, NL: 1 };
        const pa = priority[a] ?? 99;
        const pb = priority[b] ?? 99;
        return pa !== pb ? pa - pb : a.localeCompare(b);
    });

    const divOrder = ["E", "C", "W", ""];

    leagueOrder.forEach(lg => {
        const section = document.createElement("div");
        section.className = "league";

        const lgTitle = document.createElement("h2");
        lgTitle.className = "league-name";
        lgTitle.textContent = leagueNames[lg] || lg;
        section.appendChild(lgTitle);

        const divisions = grouped[lg];
        const sortedDivs = Object.keys(divisions).sort((a, b) => {
            return divOrder.indexOf(a || "") - divOrder.indexOf(b || "");
        });

        const divsContainer = document.createElement("div");
        divsContainer.className = "divisions";

        sortedDivs.forEach(div => {
            const divCard = document.createElement("div");
            divCard.className = "division";

            if (div) {
                const divTitle = document.createElement("h3");
                divTitle.className = "division-name";
                divTitle.textContent = divisionNames[div] || div;
                divCard.appendChild(divTitle);
            }

            const list = document.createElement("ul");
            divisions[div].forEach(team => {
                    const li = document.createElement("li");
                    li.innerHTML = `<span class="team-name">${team.name}</span><span class="record">${team.W ?? 0}-${team.L ?? 0}</span>`;
                    list.appendChild(li);
                });
            divCard.appendChild(list);

            divsContainer.appendChild(divCard);
        });

        section.appendChild(divsContainer);
        results.appendChild(section);
    });
});
