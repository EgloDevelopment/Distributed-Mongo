const express = require('express')
const router = express.Router()
var Datastore = require('nedb')
const MongoClient = require('mongodb').MongoClient

var nodes = new Datastore({filename: './database/nodes.json', autoload: true})
var tables = new Datastore({filename: './database/tables.json', autoload: true})
var errors = new Datastore({filename: './database/errors.json', autoload: true})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// INDEX
router.get('/', (req, res) => {
    res.json({"status":0})
})

// INDEX
router.post('/', (req, res) => {
    res.json({"status":0})
})




// DATABASES

router.post('/delete', (req, res) => {
    nodes.find({ enabled: true }, async function(err, docs) {
        try {
            const JsonAggreagate = []
            for (const val of docs) {
                const uri = val.url;
                const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                await client.connect();
                const database = client.db(req.body.database);
                const collection = database.collection(req.body.collection);
                const result = await collection.deleteMany(req.body.data);
                if (result !== null && result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        const obj = result[i];
                        JsonAggreagate.push(obj);
                    }
                }
                client.close()
            }
            res.json(JsonAggreagate);
        } catch (error) {
            console.log(error)
            errors.insert({"error":error}, function (err, result) {});
        }
    })
})

router.post('/find', (req, res) => {
    nodes.find({ enabled: true }, async function(err, docs) {
        try {
            const JsonAggreagate = []
            for (const val of docs) {
                const uri = val.url;
                const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                await client.connect();
                const database = client.db(req.body.database);
                const collection = database.collection(req.body.collection);
                const result = await collection.find(req.body.data).toArray();
                if (result !== null && result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        if (JsonAggreagate.length < req.body.limit || req.body.limit == 'none') {
                            const obj = result[i];
                            JsonAggreagate.push(obj);
                        }
                    }
                }
                client.close()
            }
            res.json(JsonAggreagate);
        } catch (error) {
            console.log(error)
            errors.insert({"error":error}, function (err, result) {});
        }
    })
})

router.post('/insert', (req, res) => {
    nodes.find({ enabled: true }, async function(err, docs) {
        try {
            let num = docs.length
            let node = getRandomInt(num)
            const uri = docs[node].url;
            const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            await client.connect();
            const database = client.db(req.body.database);
            const collection = database.collection(req.body.collection);
            const result = await collection.insertOne(req.body.data);
            res.json(result);
            client.close();
        } catch (error) {
            console.log(error)
            errors.insert({"error":error}, function (err, result) {});
        }
    })
})




// NODES

router.post('/new-node', (req, res) => {
    tables.find({ name: req.body.name }, function(err, docs) {
        if (docs[0] !== 'undefined') {
            res.json({"status":1,"error":"node with same name exists"});
            return;
        }
    });
    nodes.insert({ name: req.body.name, enabled: req.body.enabled, url: req.body.url }, async function(err, docs) {
        if (err) {
            res.json({"status":1})
        } else {
            res.json({"status":0})
        }
    })
})

router.post('/delete-node', (req, res) => {
    tables.find({ name: req.body.name }, function(err, docs) {
        if (docs[0] === 'undefined') {
            res.json({"status":1,"error":"node does not exist"});
            return;
        }
    });
    nodes.remove({ name: req.body.name }, async function(err, docs) {
        if (err) {
            res.json({"status":1})
        } else {
            res.json({"status":0})
        }
    })
})

router.post('/list-nodes', (req, res) => {
    nodes.find({}, { _id: 0 }, async function(err, docs) {
        if (err) {
            res.json({"status":1})
        } else {
            res.json(docs)
        }
    })
})




// ERRORS

router.post('/list-errors', (req, res) => {
    errors.find({}, { _id: 0 }, async function(err, docs) {
        if (err) {
            res.json({"status":1})
        } else {
            res.json(docs)
        }
    })
})

router.post('/clear-errors', (req, res) => {
    errors.remove({}, { multi: true }, async function(err, docs) {
        if (err) {
            res.json({"status":1})
        } else {
            res.json({"status":0})
        }
    })
})


module.exports = router