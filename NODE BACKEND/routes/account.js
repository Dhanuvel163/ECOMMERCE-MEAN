const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Order = require('../models/order');
const config = require('../config');
const checkJWT = require('../middlewares/ckeck-jwt');


router.post('/signup', (req, res, next) => {
 let user = new User();
 user.name = req.body.name;
 user.email = req.body.email;
 user.password = req.body.password;
 user.picture = user.gravatar();
 user.isSeller = req.body.isSeller;

 User.findOne({ email: req.body.email }, (err, userfind) => {
  if (userfind) {
    res.json({
      success: false,
      message: 'Account already exist'
    });

  } else {
    user.save();

    var token = jwt.sign({
      user: user
    }, config.secret, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Enjoy your token',
      token: token
    });
  }

 });
});

router.post('/login', (req, res, next) => {

  User.findOne({ email: req.body.email }, (err, userfind) => {
    if (err) throw err;

    if (!userfind) {
      res.json({
        success: false,
        message: 'Authenticated failed'
      });
    } else if (userfind) {

      var validPassword = userfind.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed'
        });
      } else {
        var token = jwt.sign({
          user: user
        }, config.secret, {
          expiresIn: '7d'
        });

        res.json({
          success: true,
          mesage: "Enjoy your token",
          token: token
        });
      }
    }

  });
});

router.route('/profile')
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, userfind) => {
      res.json({
        success: true,
        user: userfind,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, userfind) => {
      if (err) return next(err);

      if (req.body.name) userfind.name = req.body.name;
      if (req.body.email) userfind.email = req.body.email;
      if (req.body.password) userfind.password = req.body.password;

      userfind.isSeller = req.body.isSeller;

      userfind.save();
      res.json({
        success: true,
        message: 'Successfully edited your profile'
      });
    });
  });

  router.route('/address')
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, userfind) => {
      res.json({
        success: true,
        address: userfind.address,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, userfind) => {
      if (err) return next(err);

      if (req.body.addr1) userfind.address.addr1 = req.body.addr1;
      if (req.body.addr2) userfind.address.addr2 = req.body.addr2;
      if (req.body.city) userfind.address.city = req.body.city;
      if (req.body.state) userfind.address.state = req.body.state;
      if (req.body.country) userfind.address.country = req.body.country;
      if (req.body.postalCode) userfind.address.postalCode = req.body.postalCode;
     
      user.save();
      res.json({
        success: true,
        message: 'Successfully edited your address'
      });
    });
  });


  router.get('/orders', checkJWT, (req, res, next) => {
    Order.find({ owner: req.decoded.user._id })
      .populate('products.product')
      .populate('owner')
      .exec((err, orders) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your order"
          });
        } else {
          res.json({
            success: true,
            message: 'Found your order',
            orders: orders
          });
        }
      });
  });

  router.get('/orders/:id', checkJWT, (req, res, next) => {
    Order.findOne({ _id: req.params.id })
      .deepPopulate('products.product.owner')
      .populate('owner')
      .exec((err, order) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your order"
          });
        } else {
          res.json({
            success: true,
            message: 'Found your order',
            order: order
          });
        }
      });
  });


module.exports = router;
