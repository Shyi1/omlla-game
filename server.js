// omlla-server.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with your Service Account Key
const serviceAccount = require("./omlla-firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://omllagame-default-rtdb.europe-west1.firebasedatabase.app/"
});

const db = admin.database();

// Executive Yield Calculation Endpoint
app.post('/api/sync-yield', async (req, res) => {
    const { userId, taps } = req.body;
    
    // Logic to prevent "Auto-clicker" fraud
    if (taps > 100) {
        return res.status(403).json({ error: "High-frequency activity detected. System Locked." });
    }

    const userRef = db.ref('players/' + userId);
    await userRef.transaction(currentData => {
        if (currentData) {
            currentData.points += taps;
            currentData.lastSync = Date.now();
        }
        return currentData;
    });

    res.json({ success: true, message: "Ledger Synchronized" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OMLLA Server Active on Port ${PORT}`));
