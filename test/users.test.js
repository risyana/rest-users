const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const should = chai.should();
const expect = chai.expect();
const db = require("../database");

const users = require("../api/routes/users");

chai.use(chaiHttp);

describe("USERS", () => {
  describe("GET /users", () => {
    it("it should get all users", (done) => {
      chai.request(server)
        .get('/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('GET all users');
          res.body.should.have.property('user');
          res.body.user.should.be.a('array');
          done();
        });
    });
  });


});