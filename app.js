const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const NodeCouchDB = require('node-couchdb');

// const couch = new NodeCouchDB({
//     host: 'process.env.HOST',
//     auth: {
//         user: 'process.env.USER',
//         password: process.env.DBPASS,
//     }
// })

// var Cloudant = require('@cloudant/cloudant');

// var cloudant = new Cloudant({
//   account: '',
//   plugins: {
//     iamauth: {
//       iamApiKey: ''
//     }
//   }
// });
// cloudant.db.list(function(err, body) {
//   body.forEach(function(db) {
//     console.log(db);
//   });
// });

const couch = new NodeCouchDB({
    host: 'localhost',
    port: 5984,
    // auth: {
    //     user: 'joseph',
    //     password: process.env.DBPASS,
    // }
})

const dbName = 'people';
const viewUrl = '_all_docs?include_docs=true'

// couch.listDatabases()
// .then((dbs) => {
//     console.log(dbs[4]);
// })

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    couch.get(dbName, viewUrl)
    .then(({data, headers, status}) => {
        // console.log(data)
        res.render('index', {
            people:data.rows
        })
    })
    .catch(err => {
        console.log(err);
    });
});

app.post('/people/add' , (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email
    const street = req.body.street
    const city = req.body.city
    const state = req.body.state
    couch.uniqid().then((ids) => {
        const id = ids[0];
        couch.insert(dbName,  {
            _id: id,
            fname: fname,
            lname: lname,
            email: email,
            address: {
                street: street, 
                city: city, 
                state: state
            }
        })
        .then(({data, headers, status}) => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
    })
})

app.post('/people/delete/:id', (req, res) => {
    let id = req.params.id;
    let rev = req.body.rev;
    couch.del(dbName, id, rev)
    .then((data, headers, status)=> {
        res.redirect('/')
    })
    .catch(err => {
        console.log(err)
    })

})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})