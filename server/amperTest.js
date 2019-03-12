//get amper
const AmperTango = require('amper-tango/amper-tango.node');

AmperTango
    .get_ping()
    .then(({ping}) => {
        console.log('Ping', ping.attributes.ping); // Should equal: "pong"
    })
    .catch((err) => {
        console.error('Could not ping', err);
    });