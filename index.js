const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const dataFilePath = path.join(__dirname, 'data.json');

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to get the authorization code
app.get('/get-auth-code', (req, res) => {
    res.json({ AUTH_CODE: process.env.AUTH_CODE });
});

// Endpoint to get the races and pilots data
app.get('/get-races', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to save the races and pilots data
app.post('/save-races', (req, res) => {
    const { races, pilots } = req.body;
    const data = { races, pilots };
    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(200).send('Data saved successfully');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Initialize data.json file if it does not exist
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify({
            races: [
                [3, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Race 1 results
                [4, 2, 1, 3, 6, 5, 8, 7, 10, 9, 12, 11], // Race 2 results
                [2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 12, 11], // Race 3 results
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]  // Race 4 results
            ],
            pilots: [
                "Pilot 1", "Pilot 2", "Pilot 3", "Pilot 4", "Pilot 5",
                "Pilot 6", "Pilot 7", "Pilot 8", "Pilot 9", "Pilot 10",
                "Pilot 11", "Pilot 12"
            ]
        }, null, 2), 'utf8');
    }
});
