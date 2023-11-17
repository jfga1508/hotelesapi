const { client } = require('../mongo');
const { transporter } = require('./mail');
const data = client.database('hotelsdb').container('reservations');
const hotels = client.database('hotelsdb').container('hotels');

async function get(req, res) {
    const { id, hotelId } = req.params;

    const querySpec = {};

    if (id) {
        querySpec.query = `SELECT * FROM root r WHERE r.id = '${id}'`;
    }
    if (hotelId) {
        querySpec.query = `SELECT * FROM root r WHERE r.hotelId = '${hotelId}'`;
    }

    /*if (from && to) {
        querySpec.query = `SELECT * FROM root r JOIN rooms in r.rooms JOIN reservations in rooms.reservations WHERE reservations.checkin >= '${from}' AND reservations.checkout <= '${to}'`;
    }*/

    const { resources: results } = querySpec.query
        ? await data.items.query(querySpec).fetchAll()
        : await data.items.readAll().fetchAll();

    res.json(results);
}

async function create(req, res) {
    const { hotelId, checkin, checkout } = req.body;

    const { resource: reservationData } = await data.items
        .upsert(req.body)
        .then((data) => data);

    const querySpec = {
        query: `SELECT VALUE r FROM root r WHERE r.id = '${hotelId}'`,
    };
    const { resources: body } = await hotels.items.query(querySpec).fetchAll();

    const newBody = {
        ...body[0],
        rooms: body[0].rooms.map((room) => {
            if (room.roomId == req.body.room.roomId) {
                room.reservations = [
                    ...room.reservations,
                    {
                        reservationId: reservationData.id,
                        checkin: checkin,
                        checkout: checkout,
                    },
                ];
            }
            return room;
        }),
    };

    const { resource: results } = await hotels
        .item(hotelId, body[0].hotelId)
        .replace(newBody)
        .then((data) => {
            const mailOptions = {
                from: 'no-reply@gmail.com',
                to: req.body.user.email,
                subject: `Your hotel reservation`,
                text: `Hello ${req.body.user.name}, \n\n Your reservation is complete!`,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            return data;
        });
    res.json({ status: true, data: results });
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
