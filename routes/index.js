const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const public_key = fs.readFileSync(path.join(__dirname , '../public', 'public.pem'), 'utf8');
//TODO : "HIDE" key in the website
// const private_key = fs.readFileSync(path.join(__dirname , '../public', 'private.key'), 'utf8');
// TODO: move secret somewhere else
// TODO: Change to stronger one
const secret = "8JA^hy2O3Y4*O8H)";

const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'];

// home page
router.get('/', function(req, res){
  res.sendFile(path.join(__dirname , '../public', 'index.html'));
});


/** Verify token
 Return signature failed of sign didn't match
 Use the 'auth' parameter from the JWT header
 **/

function handleVerify(err, decoded){
  if (err){
    throw Error(err);
  }
  else{
    return decoded;
  }
}
function verifyToken(token, alg){
  const signOptions = {
    algorithm: alg
  }
  if(alg.startsWith("RS")){
    return jwt.verify(token, public_key, signOptions, handleVerify);
  }
  else if(alg.startsWith("HS")){
    console.log('HMAC Detected')
    return jwt.verify(token, secret, signOptions, handleVerify)
  }
  else{
    throw Error("Unsupported algorithm");
  }
}

router.get('/verify', function(req, res, next) {
  const token = req.get("Token");
  const decoded = jwt.decode(token, {"complete": true});
  const alg = decoded.header.alg;
  if (!token) {
    // TODO: replace with authorization middleware
    return res.send("No token was provided. \nPlease provide a 'Token' header");
  }
  if (alg === "none"){
    return res.status(404).json('None none for you!');
  }
  // Check unsupported alg use
  if(!SUPPORTED_ALGS.includes(alg)){
    return res.send("Unsupported algorithm. Nice try.");
  }
  console.log('verifying')
  // Verify token according to algorithm
  try {
    const tokenVerificationResult = verifyToken(token, alg);
    console.log(tokenVerificationResult);
    return res.send(tokenVerificationResult);
  }
  catch (e) {
    const errorMessage = e.message
    console.error(errorMessage)
    return res.status(500).json({errorMessage})
  }
});

// Returns signed JWT
router.get('/token', function(req, res, next) {
  const token = jwt.sign({ "username": "user" }, secret, {algorithm: 'HS256'});
  res.json({'token': token});
});

router.get('/print', function (req, res){
  const token = req.get("Token");
  const decoded = jwt.decode(token, {"complete": true});
  return res.json({"full_token": decoded,"header": decoded.header.alg});
});

// Returns signed JWT
// router.get('/token', function(req, res, next) {
//   let token = jwt.sign({ "username": "user" }, private_key);
//   res.json({'token': token});
// });
// TODO : Error page
module.exports = router;
