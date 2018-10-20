const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);
describe('TOKEN', () => {
  describe('Check Token', () => {
    it('should not authorized. Due to authorization header does not specified', (done) => {
      chai.request(server)
        .get('/users/')
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Auth failed : no auth header');
          done();
        });
    });
  });
});
