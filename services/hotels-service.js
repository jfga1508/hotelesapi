const { client } = require('../mongo');
const data = client.database('hotelsdb').container('hotels');

async function get(req, res) {
    const { id, city } = req.params;

    const querySpec = {};

    if (id) {
        querySpec.query = `SELECT VALUE r FROM root r WHERE r.id = '${id}'`;
    }

    if (city) {
        querySpec.query = `SELECT VALUE r FROM root r WHERE CONTAINS(r.city, '${city.toLowerCase()}')`;
    }

    const { resources: results } = querySpec.query
        ? await data.items.query(querySpec).fetchAll()
        : await data.items.readAll().fetchAll();

    res.json(results);
}

async function create(req, res) {
    await data.items.upsert(req.body).then((data) => {
        res.json({ status: true });
    });
}

async function update(req, res) {
    const { id, hotelId } = req.body;

    await data
        .item(id, hotelId)
        .replace(req.body)
        .then((data) => {
            res.json({ status: true });
        });
}

async function destroy(req, res) {
    const { id, hotelId } = req.body;

    const { item } = await data.item(id).delete(req.body);
    res.json(item);
}

module.exports = { get, create, update, destroy };
