const { client } = require('../mongo');
const data = client.database('hotelsdb').container('users');
const { v4: uuidv4 } = require('uuid');

async function get(req, res) {
    const { email, password } = req.body;

    const querySpec = {
        query: `SELECT VALUE r FROM root r WHERE r.email = '${email}' AND r.password = '${password}'`,
    };

    const { resources: results } = await data.items.query(querySpec).fetchAll();

    if (results.length > 0) {
        res.json({ token: uuidv4() });
    } else {
        res.json({
            error: `Can't validate credentials, please check and try again.`,
        });
    }
}

module.exports = { get };
