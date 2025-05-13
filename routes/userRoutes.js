const express = require('express');
const bcrypt = require('bcrypt');

module.exports = function(db) {
    const router = express.Router();

    router.post('/register', async (req, res) => {
        const { username, password } = req.body;

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
            res.status(201).send('User registered successfully');
        } catch (error) {
            console.error(error);
            res.status(500).send('Something went wrong');
        }
    });

    // Login Route
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            // Fetch user from DB
            const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

            if (!user) {
                return res.status(401).send('Invalid username or password');
            }

            // Compare password with hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).send('Invalid username or password');
            }

            // Successful login
            if(req.session){
                req.session.user = {userId: user.userId, username: user.username}
            }
            res.status(200).send('Login successful');
        } catch (error) {
            console.error(error);
            res.status(500).send('Something went wrong');
        }
    });

    return router;
};
