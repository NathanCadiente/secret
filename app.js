require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username}, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets');
                } else {
                    console.log('Password Incorrect...');
                }
            } else {
                console.log('User not found...');
            }
        });
    });

app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password 
        });

        newUser.save((err) => {
            if (!err) {
                res.render('secrets');
            } else {
                console.log(err);
            }
        });
    });

app.listen(port, () => console.log(`Server is running on port ${port}.`));