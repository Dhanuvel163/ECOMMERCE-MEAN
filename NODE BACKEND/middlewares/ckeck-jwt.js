const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    jwt.verify(token, "njoy your days regularly", function(err, decoded) {
      if (err) {
        res.json({
          success: false,
          message: 'Failed to authenticate'
        });
      } else 
      {
        req.decoded = decoded;
        next();

      }
    });

  } else {

    res.status(403).json({
      success: false,
      message: 'No token'
    });

  }
}