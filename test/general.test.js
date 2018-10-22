const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const should = chai.should();

chai.use(chaiHttp);

// long expiry token: 23 Oct 2023
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjcyLCJlbWFpbCI6ImxhaUBhcGEuY29tIiwibmFtZSI6ImxhaWxpIiwicGhvbmUiOiIxMTIyMzMzMzIyMTEiLCJpYXQiOjE1NDAwNzMzMzUsImV4cCI6MTY5Nzg2MTMzNX0.T9G1e-Ay3H7rmtUtd0GE0T9ldYycJbNWRcsfuJunBFo';
// expired token
const invalidToken = 'Bearer xyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsImVtYWlsIjoibGFpbGlAYXBhLmNvbSIsIm5hbWUiOiJsYWlsaSBmYXpyaSBwcmliYWRpIiwicGhvbmUiOiI5MDkwOTA5MCIsImlhdCI6MTUzMzM2NjU5NiwiZXhwIjoxNTMzMzcwMTk2fQ.b9XbKeddwyjao3DPhqvkxUDugANSBLT4jRC0AyGEpHk';


describe('GENERAL', () => {
  describe('Check Connection', () => {
    it('Should return 200', (done) => {
      chai.request(server)
        .get('/general/connection')
        .end((err, res) => {
          res.status.should.eql(200);
          res.body.should.have.property('message');
          res.body.message.should.eql('Resource Available..');
          done();
        });
    });
  });
  describe('Check Token', () => {
    it('Should return 200, since the token is valid', (done) => {
      chai.request(server)
        .post('/general/token')
        .set('Authorization', token)
        .end((err, res) => {
          res.status.should.eql(200);
          res.body.should.have.property('message');
          res.body.message.should.eql('Token is valid');
          res.body.should.have.property('user');
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('email');
          res.body.user.should.have.property('name');
          res.body.user.should.have.property('phone');
          res.body.user.should.not.have.property('password');
          done();
        });
    });
    it('Should return 401, since the token is invalid', (done) => {
      chai.request(server)
        .post('/general/token')
        .set('Authorization', invalidToken)
        .end((err, res) => {
          res.status.should.eql(401);
          res.body.should.have.property('message');
          res.body.message.should.contain('Auth failed');
          done();
        });
    });
  });
});
