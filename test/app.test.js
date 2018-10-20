const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);
describe('APP.JS', () => {
  describe('Check Resources', () => {
    it('should error. Due to specified resource is not found', (done) => {
      chai.request(server)
        .get('/xxxxxx/') // this routes is not found.
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Resource not found');
          done();
        });
    });
  });
});
