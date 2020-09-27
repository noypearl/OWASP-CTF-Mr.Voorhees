const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const validator = require('validator');
const expect = chai.expect;
const parseCookie = require('set-cookie-parser');
const chaiHttp = require('chai-http');

const private_key = fs.readFileSync(path.join(__dirname, '../assets', 'private.key'), 'utf8');
const public_key = fs.readFileSync(path.join(__dirname, '../assets', 'public.pem'), 'utf8');

const pages = {
    home: fs.readFileSync(path.join(__dirname , '../public', '/index.html')),
    error: fs.readFileSync(path.join(__dirname , '../public', '/error.html'))
}
const app = require('../app.js');
// Configure chai
chai.use(chaiHttp);

const generateJWT = (username, key, alg , extras = {}) => {
    const payload = {username, ...extras}
    return jwt.sign(payload, private_key, {algorithm: alg});
}

const getTokenFromCookie = (cookieStr) => {
    const cookiesArr = parseCookie(cookieStr)
        for(const line of cookiesArr) {
            if (line.name && line.name === "token")
                return line.value;
        };
    throw Error("Cookie doesn't exist");
}



describe('Get new token', () => {
    it('should return token to request without token cookie', () => {
        chai.request(app)
            .get('/')
            .set("Cookie", "something")
            .end((err, res) => {
                expect(err).to.be.null;
                const token = getTokenFromCookie(res.header["set-cookie"]);
                expect(token).to.not.be.null;
                const isTokenJWT = validator.isJWT(token);
                expect(isTokenJWT).to.be.true;
                expect(res.status).to.equal(200);
            });
    });
    it('should return token to request without cookies at all', () => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(err).to.be.null;
                const token = getTokenFromCookie(res.header["set-cookie"]);
                expect(token).to.not.be.null;
                const isTokenJWT = validator.isJWT(token);
                expect(isTokenJWT).to.be.true;
                expect(res.status).to.equal(200);
            });
    });

    describe('Pages request', () => {
        it('should return 404 error page', () => {
            chai.request(app)
                .get('/aaaaa')
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.type).to.equal("text/html");

                });
        });
        it('should return homepage to /', () => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.type).to.equal("text/html");
                    expect(err).to.be.null;
                });
        });
        it('should return error page for invalid request method', () => {
            chai.request(app)
                .put('/')
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.type).to.equal("text/html");
                });
        });
    });

//
describe('Validate token', () => {
    it('should return homepage for user test', () => {
        const token = generateJWT("test", private_key);
        chai.request(app)
            .get('/')
            .set("Cookie",`token=${token}`)
            .end((err, res) => {
               expect(res.status).to.equal(200);
               expect(res.type).to.equal("text/html");
            });
    });
    it('should return None nan for you error', () => {
        const token = generateJWT("admin", private_key, "none")
        chai.request(app)
            .get('/')
            .set("Cookie", `token=${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(401);
                expect(res.error.text).to.equal("None none for you!")
        });

    });
    // TODO - pass this test in order to fix a bug in verifier.js
    it('should return unauthorized message 401 when sending jwt with string as payload instead of json',  () => {
            const payload = "Tester";
            const token = jwt.sign(payload, private_key, {algorithm: "RS256"});
            chai.request(app)
                .get('/')
                .set("Cookie", `token=${token}`)
                .end((err, res) => {
                    expect(res.status).to.equal(401);
                    // expect(res.body).to.equal("None none for you!")
                })

        });
    it('should return invalid JWT token for non-jwt token', () => {

    });
    it('should return FLAG for token with admin', () => {

    });
    it('should return FLAG for token with admin and aditionals', () => {
        const test = jwt.sign({username: "NOY"}, "ABC");
        const test_decry = jwt.verify(test,"ABC")
        // loggers.warn(`HERE it is ${test_decry}`)
        const token = jwt.sign({username: "admin"}, "ABC");
        chai.request(app)
            .get('/')
            .set("Cookie", `token=${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal("FLAG!");
            })
    });
    it('should return unsupported method', () => {

    });
});

});


