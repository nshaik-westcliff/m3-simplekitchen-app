const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

// changed: home page is now Simple Kitchen
router.get('/', (req, res) => {
  res.render('index', { title: 'Simple Kitchen' });
});

// new: registration form page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register to subscribe' });
});

// changed: /registrations -> /registrants, renders registrants.pug
router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrants', registrations });
    })
    .catch(() => {
      res.send('Sorry! Something went wrong.');
    });
}));

// changed: posts to /register
router.post('/register',
    [
        check('name')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
        check('email')
        .isLength({ min: 1 })
        .withMessage('Please enter an email'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          const registration = new Registration(req.body);
          registration.save()
            .then(() => { res.render('thankyou', { title: 'Thank you' }); })   // changed
            .catch((err) => {
              console.log(err);
              res.send('Sorry! Something went wrong.');
            });
          } else {
            res.render('register', {                // changed
                title: 'Register to subscribe',     // changed
                errors: errors.array(),
                data: req.body,
             });
          }
    });

module.exports = router;