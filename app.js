const express   = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const nano = require('nano')('http://localhost:5984');
const people = nano.use('people')
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    people.list({include_docs: true})
        .then((data) => {
            // console.log(data.rows)
            res.render('index', {
                people:data.rows
            })
        })
        .catch(err => {
            console.log(err);
        });
    })

app.post('/people/add' , (req, res) => {
    const fname = req.body.fname;
          lname = req.body.lname;
          email = req.body.email;
          street = req.body.street;
          city = req.body.city;
          state = req.body.state;
    people.insert({
        fname: fname,
        lname: lname,
        email: email,
        address: {
            street: street, 
            city: city, 
            state: state
        }
    })
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
    })

app.post('/people/delete/:id', (req, res) => {
    let id = req.params.id;
    let rev = req.body.rev;
    people.destroy(id, rev)
        .then((data)=> {
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