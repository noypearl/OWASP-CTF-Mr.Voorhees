const jwt = require('jsonwebtoken');
const fs = require('fs');
const chai = require('chai');
const validator = require('validator');
const parseCookie = require('set-cookie-parser');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const app = require('../src/app.js');

const {
  privateKeyPath, robotsFilePath, publicKeyPath, indexFilePath, errorPagePath, directoryListingPagePath,
} = require('../src/helpers/staticFiles');

const { expect } = chai;
const privateKeyContent = fs.readFileSync(privateKeyPath, 'utf-8');
const publicKeyContent = fs.readFileSync(publicKeyPath, 'utf-8');
const robotsFile = fs.readFileSync(robotsFilePath, 'utf-8');
const indexPage = fs.readFileSync(indexFilePath, 'utf-8');
const errorPage = fs.readFileSync(errorPagePath, 'utf-8');
const directoryListingPage = fs.readFileSync(directoryListingPagePath, 'utf-8');

const {
  UNSUPPORTED_ALG, TRY_AGAIN, NONE_NONE, FLAG, WHO_ARE_YOU,
} = require('../src/helpers/responses.json');

const generateJWT = (username, key, alg, extras = {}) => {
  const payload = { username, ...extras };
  return jwt.sign(payload, key, { algorithm: alg });
};

const getTokenFromCookie = (cookieStr) => {
  const cookiesArr = parseCookie(cookieStr);
  for (const line of cookiesArr) {
    if (line.name && line.name === 'token') return line.value;
  }
  throw Error("Cookie doesn't exist");
};

describe('Test access', () => {
  it('should return token to request without cookie', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(err).to.be.null;
        const token = getTokenFromCookie(res.header['set-cookie']);
        expect(token).to.not.be.null;
        const isTokenJWT = validator.isJWT(token);
        expect(res.text).to.equal(indexPage);
        expect(isTokenJWT).to.be.true;
        expect(res.status).to.equal(200);
        done();
      });
  });
  it(`should return ${TRY_AGAIN.name} for token with invalid signature`, (done) => {
    const token = jwt.sign('hello', publicKeyContent, { algorithm: 'HS256' });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(token).to.not.be.null;
        const isTokenJWT = validator.isJWT(token);
        expect(isTokenJWT).to.be.true;
        expect(res.status).to.equal(TRY_AGAIN.code);
        expect(res.error.text).to.equal(TRY_AGAIN.name);
        done();
      });
  });
  // token will be {header: {.....}, "HelloA"} instead of {header: {.....}, {username: "me"}
  it(`should return ${TRY_AGAIN.code} for token with string body instead of object body`, (done) => {
    const token = jwt.sign('hello', publicKeyContent, { algorithm: 'HS256' });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(token).to.not.be.null;
        const isTokenJWT = validator.isJWT(token);
        expect(isTokenJWT).to.be.true;
        expect(res.status).to.equal(TRY_AGAIN.code);
        expect(res.error.text).to.equal(TRY_AGAIN.name);
        done();
      });
  });

  it('should return error page for request to invalid route with valid token', (done) => {
    const token = generateJWT('admin', publicKeyContent, 'HS256');
    chai.request(app)
      .get('/heeey')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.equal(errorPage);
        done();
      });
  });

  it('should return 404 error page for request to invalid URL', (done) => {
    chai.request(app)
      .get('/aaaaa')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.equal(errorPage);
        done();
      });
  });
  it('should return 404 error page for PUT request', (done) => {
    chai.request(app)
      .put('/blah')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.equal(errorPage);
        done();
      });
  });
  it('should successfully return robots page', (done) => {
    chai.request(app)
      .get('/robots.txt')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.type).to.equal('text/plain');
        expect(res.text).to.equal(robotsFile);
        expect(err).to.be.null;
        done();
      });
  });
  it('should return homepage to /', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.equal(indexPage);
        expect(err).to.be.null;
        done();
      });
  });
  it('should return error page for invalid request method', (done) => {
    chai.request(app)
      .put('/')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.equal(errorPage);
        expect(err).to.be.null;
        done();
      });
  });

  it('should return homepage for user test', (done) => {
    const token = generateJWT('test', privateKeyContent, 'RS256');
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.equal(indexPage);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${NONE_NONE.name} error for request with none algorithm`, (done) => {
    const token = generateJWT('admin', privateKeyContent, 'none');
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(NONE_NONE.code);
        expect(res.error.text).to.equal(NONE_NONE.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${TRY_AGAIN.name} ${TRY_AGAIN.code} when sending jwt with string as payload instead of json`, (done) => {
    const payload = 'Tester';
    const token = jwt.sign(payload, privateKeyContent, { algorithm: 'RS256' });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(TRY_AGAIN.code);
        expect(res.text).to.equal(TRY_AGAIN.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${TRY_AGAIN.name} for non-jwt token`, (done) => {
    const token = 'MEVIN';
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(TRY_AGAIN.code);
        expect(res.text).to.equal(TRY_AGAIN.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return flag ${FLAG.name} for solution using the vuln`, (done) => {
    const token = generateJWT('admin', publicKeyContent, 'HS256');
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(FLAG.code);
        expect(res.text).to.equal(FLAG.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return flag ${FLAG.name} for token signed privately`, (done) => {
    const token = generateJWT('admin', privateKeyContent, 'RS256');
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(FLAG.code);
        expect(res.text).to.equal(FLAG.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${FLAG.name} for token with admin and additional`, (done) => {
    const token = generateJWT('admin', publicKeyContent, 'HS256', { test: 2 });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(FLAG.code);
        expect(res.text).to.equal(FLAG.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${FLAG.name} for token with AdMiN in capital and extras`, (done) => {
    const token = generateJWT('AdMiN', publicKeyContent, 'HS256', { test: 2 });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(FLAG.code);
        expect(res.text).to.equal(FLAG.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${TRY_AGAIN.name} for invalid JWT signature`, (done) => {
    const token = generateJWT('admin', 'falsy-key', 'HS256', { test: 2 });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(TRY_AGAIN.code);
        expect(res.text).to.equal(TRY_AGAIN.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${UNSUPPORTED_ALG.name} for HS384`, (done) => {
    const token = generateJWT('admin', 'AAAA', 'HS384');
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(UNSUPPORTED_ALG.code);
        expect(res.text).to.equal(UNSUPPORTED_ALG.name);
        expect(err).to.be.null;
        done();
      });
  });
  it(`should return ${WHO_ARE_YOU.name} for token without a username`, (done) => {
    const payload = { show: 'time' };
    const token = jwt.sign(payload, privateKeyContent, { algorithm: 'RS256' });
    chai.request(app)
      .get('/')
      .set('Cookie', `token=${token}`)
      .end((err, res) => {
        expect(res.status).to.equal(WHO_ARE_YOU.code);
        expect(res.error.text).to.equal(WHO_ARE_YOU.name);
        expect(err).to.be.null;
        done();
      });
  });
  it('should return directory listing for request to /backup', (done) => {
    chai.request(app)
      .get('/backup')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(directoryListingPage);
        expect(res.type).to.equal('text/html');
        expect(err).to.be.null;
        done();
      });
  });
  it('should return public key for request to /backup/public.pem', (done) => {
    chai.request(app)
      .get('/backup/public.pem')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.type).to.equal('application/x-x509-ca-cert');
        expect(err).to.be.null;
        done();
      });
  });
});
