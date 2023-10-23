const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const PORT = process.env.PORT || 3500;
// const weaponController = require('./controllers/weaponController');
const cors = require("cors"); // Import the cors middleware
const bodyParser = require('body-parser');
const Weapon = require('./models/weapon')

connectDB();

// Serve static frontend files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON parsing middleware

console.log("hii");

app.post('/', (req, res) => {
    console.log('POST request received');
    
    let prediction = req.body.prediction
    console.log(prediction);

    Weapon.create({
        name: prediction,
        time: new Date(),
    });

    // Respond to the client if needed
    res.status(201).send({ message: 'Data received successfully' });
});


mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB.");
  
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});





