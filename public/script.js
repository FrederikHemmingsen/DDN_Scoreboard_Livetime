document.addEventListener("DOMContentLoaded", function() {
    let pilots = [];
    let races = [];
    let isEditingEnabled = false;

    const pointsTable = {
        1: 75,
        2: 68,
        3: 65,
        4: 62,
        5: 60,
        6: 58,
        7: 56,
        8: 54,
        9: 52,
        10: 51
    };

    function getPoints(position) {
        if (position <= 10) {
            return pointsTable[position];
        } else {
            return 51 - (position - 10);
        }
    }

    async function fetchAuthCode() {
        const response = await fetch('/get-auth-code');
        const data = await response.json();
        return data.AUTH_CODE;
    }

    async function fetchData() {
        const response = await fetch('/get-races');
        const data = await response.json();
        return data;
    }

    function calculateScores() {
        let scores = pilots.map(pilot => ({ name: pilot, total: 0, races: [] }));

        races.forEach((race, raceIndex) => {
            race.forEach((placement, pilotIndex) => {
                let points = getPoints(placement);
                scores[pilotIndex].races[raceIndex] = points;
                scores[pilotIndex].total += points;
            });
        });

        scores.sort((a, b) => b.total - a.total); // Descending order

        return scores;
    }

    function renderScoreboard() {
        const scores = calculateScores();
        const tbody = document.getElementById('scoreboard-body');
        tbody.innerHTML = "";

        scores.forEach((score, pilotIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${score.name}</td>
                ${score.races.map((race, raceIndex) => `
                    <td>${isEditingEnabled ? `<input type="number" value="${races[raceIndex][pilotIndex]}" data-pilot-index="${pilotIndex}" data-race-index="${raceIndex}" />` : race}</td>
                `).join('')}
                <td>${score.total}</td>
            `;
            tbody.appendChild(row);
        });

        if (isEditingEnabled) {
            addInputEventListeners();
        }
    }

    function addInputEventListeners() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                const pilotIndex = this.dataset.pilotIndex;
                const raceIndex = this.dataset.raceIndex;
                const value = parseInt(this.value, 10);

                if (!isNaN(value)) {
                    races[raceIndex][pilotIndex] = value;
                    renderScoreboard();
                }
            });
        });
    }

    window.enableEditing = async function() {
        const authCode = document.getElementById('auth-code').value;
        const storedAuthCode = await fetchAuthCode();
        if (authCode === storedAuthCode) {
            isEditingEnabled = true;
            document.getElementById('save-button').style.display = 'inline';
            renderScoreboard();
        } else {
            alert('Invalid authorization code!');
        }
    }

    window.saveChanges = async function() {
        const response = await fetch('/save-races', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ races, pilots })
        });
        if (response.ok) {
            alert('Changes saved successfully!');
            window.location.reload();
        } else {
            alert('Failed to save changes.');
        }
    }

    async function initialize() {
        const data = await fetchData();
        pilots = data.pilots;
        races = data.races;
        renderScoreboard();
    }

    initialize();
});
