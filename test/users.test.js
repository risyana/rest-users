const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcrypt');
const server = require('../server');
const db = require('../database');

const { expect } = chai;
const should = chai.should();

// long expiry token: 23 Oct 2023
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjcyLCJlbWFpbCI6ImxhaUBhcGEuY29tIiwibmFtZSI6ImxhaWxpIiwicGhvbmUiOiIxMTIyMzMzMzIyMTEiLCJpYXQiOjE1NDAwNzMzMzUsImV4cCI6MTY5Nzg2MTMzNX0.T9G1e-Ay3H7rmtUtd0GE0T9ldYycJbNWRcsfuJunBFo';
// expired token
const invalidToken = 'Bearer xyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsImVtYWlsIjoibGFpbGlAYXBhLmNvbSIsIm5hbWUiOiJsYWlsaSBmYXpyaSBwcmliYWRpIiwicGhvbmUiOiI5MDkwOTA5MCIsImlhdCI6MTUzMzM2NjU5NiwiZXhwIjoxNTMzMzcwMTk2fQ.b9XbKeddwyjao3DPhqvkxUDugANSBLT4jRC0AyGEpHk';

chai.use(chaiHttp);

describe('USERS', () => {
  describe('POST /users/emails', () => {
    it('Should return raw.COUNT = 0', (done) => {
      chai.request(server)
        .post('/users/emails')
        .send({ email: 'inipastigakada@xx.com' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Get number of email');
          res.body.should.have.property('row');
          res.body.row.should.be.a('object');
          res.body.row.should.have.property('COUNT');
          res.body.row.COUNT.should.be.eql(0);
          done();
        });
    });

    before(() => {
      const email = 'inipastiada@ada.com';
      const dummy = [null, email, 'y', 'z', '1'];
      const stmt = 'INSERT INTO USERS VALUES (?, ?, ?, ?, ?)';
      db.run(stmt, dummy);
    });
    it('Should return raw.COUNT > 1', (done) => {
      chai
        .request(server)
        .post('/users/emails')
        .send({ email: 'inipastiada@ada.com' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Get number of email');
          res.body.should.have.property('row');
          res.body.row.should.be.a('object');
          res.body.row.should.have.property('COUNT');
          res.body.row.COUNT.should.greaterThan(0);
          done();
        });
    });
    after(() => {
      const email = 'inipastiada@ada.com';
      const stmt = 'DELETE FROM USERS WHERE EMAIL = ?';
      db.run(stmt, email);
    });
  });

  describe('POST /users/phones', () => {
    it('Should return raw.COUNT = 0', (done) => {
      chai.request(server)
        .post('/users/phones')
        .send({ phone: '99999999999999111111111777777' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Get number of phone');
          res.body.should.have.property('row');
          res.body.row.should.be.a('object');
          res.body.row.should.have.property('COUNT');
          res.body.row.COUNT.should.be.eql(0);
          done();
        });
    });

    before(() => {
      const phone = '1234567890123';
      const dummy = [null, 'x', 'y', 'z', phone];
      const stmt = 'INSERT INTO USERS VALUES (?, ?, ?, ?, ?)';
      db.run(stmt, dummy);
    });
    it('Should return raw.COUNT > 1', (done) => {
      chai
        .request(server)
        .post('/users/phones')
        .send({ phone: '1234567890123' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Get number of phone');
          res.body.should.have.property('row');
          res.body.row.should.be.a('object');
          res.body.row.should.have.property('COUNT');
          res.body.row.COUNT.should.greaterThan(0);
          done();
        });
    });
    after(() => {
      const phone = '1234567890123';
      const stmt = 'DELETE FROM USERS WHERE PHONE = ?';
      db.run(stmt, phone);
    });
  });

  describe('POST /users', () => {
    const newUser = {
      email: 'yyyyy@xxx.com',
      name: 'xxxx',
      password: 'something1234',
      phone: '44552211',
    };

    const invalidNewUser = {
      email: 'yyyyy@xxx.com',
      name: 'xxxx',
      password: null,
      phone: '44552211',
    };

    const nullNewUser = {
      email: null,
      name: 'xxxx',
      password: 'something1234',
      phone: '44552211',
    };

    it('It should post new user', (done) => {
      chai.request(server)
        .post('/users')
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('POST new user');
          res.body.should.have.property('newUser');
          res.body.newUser.should.be.a('object');
          res.body.newUser.should.be.eql(newUser);
          done();
        });
    });

    after(() => {
      let stmt = '';
      let lastID;
      // get latest ID
      stmt = 'SELECT MAX(ID) ID FROM USERS';
      db.get(stmt, (err, row) => {
        if (err) {
          console.log('err select: ', err);
        } else {
          lastID = row.ID;
          // delete latest ID
          stmt = 'DELETE FROM USERS WHERE ID = ? ';
          db.run(stmt, lastID, (error) => {
            if (error) {
              console.log('err delete: ', error);
            }
          });
        }
      });
    });

    it('should not post new user. Due to password is blank', (done) => {
      chai.request(server)
        .post('/users/')
        .set('Authorization', token)
        .send(invalidNewUser)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.be.a('string');
          done();
        });
    });

    it('should not post new user. Due to email, name, phone is blank', (done) => {
      chai.request(server)
        .post('/users/')
        .set('Authorization', token)
        .send(nullNewUser)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.be.a('string');
          done();
        });
    });
  });

  describe('GET /users', () => {
    it('it should get all users', (done) => {
      chai.request(server)
        .get('/users')
        .set('Authorization', token)
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

    it('it should NOT get any users. Due to invalid/expired token', (done) => {
      chai.request(server)
        .get('/users')
        .set('Authorization', invalidToken)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.match(/Auth failed/);

          done();
        });
    });
  });

  describe('GET /users/:id', () => {
    const userID = 1;
    const InvalidUserID = 999;

    it('It should get one user', (done) => {
      chai.request(server)
        .get(`/users/${userID}`)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql(`GET user ${userID}`);
          res.body.should.have.property('user');
          res.body.user.should.be.a('object');
          done();
        });
    });

    it('It should NOT get a user. Due to record not found', (done) => {
      chai.request(server)
        .get(`/users/${InvalidUserID}`)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql(`GET user ${InvalidUserID}`);
          res.body.should.have.property('user');
          expect(res.body.user).to.be.a('null');
          done();
        });
    });
  });

  describe('PATCH /users/:id', () => {
    const updatedUserId = 7;
    const nonExistUserId = 99999;
    const updatedUser = {
      email: 'new123@yayay.com',
      name: 'new',
      password: 'satu123123',
      phone: '01018181818',
    };
    const nullUpdatedUser = {
      email: null,
      name: 'new',
      password: 'aaaaaaaaa12123',
      phone: '01018181818',
    };

    it('should update user', (done) => {
      chai.request(server)
        .patch(`/users/${updatedUserId}`)
        .set('Authorization', token)
        .send(updatedUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql(`PATCH specific user ${updatedUserId}`);
          res.body.should.have.property('updatedUser');
          res.body.updatedUser.should.have.property('email');
          res.body.updatedUser.should.have.property('name');
          res.body.updatedUser.should.have.property('password');
          res.body.updatedUser.should.have.property('phone');
          const expectedUpdatedUser = Object.assign({},
            updatedUser.email, updatedUser.name, updatedUser.phone);
          const actualUpdatedUser = Object.assign({},
            res.body.updatedUser.email, res.body.updatedUser.name, res.body.updatedUser.phone);

          actualUpdatedUser.should.eql(expectedUpdatedUser);
          done();
        });
    });

    it('should not update anyting. Due to user id not exist', (done) => {
      chai.request(server)
        .patch(`/users/${nonExistUserId}`)
        .set('Authorization', token)
        .send(updatedUser)
        .end((err, res) => {
          res.should.have.status(202);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('nothing to update');
          done();
        });
    });

    it('should not update user. Due to email, name, phone is blank', (done) => {
      chai.request(server)
        .patch(`/users/${updatedUserId}`)
        .set('Authorization', token)
        .send(nullUpdatedUser)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.be.a('string');
          done();
        });
    });
  });

  describe('PATCH /users/password/:id', () => {
    const updatedUserId = 7;
    const nonExistUserId = 99999;
    const validPassword = {
      password: 'myNewPassword',
    };
    const blankPassword = {
      password: null,
    };
    it('should update password', (done) => {
      chai.request(server)
        .patch(`/users/password/${updatedUserId}`)
        .set('Authorization', token)
        .send(validPassword)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property('message');
          res.body.message.should.eql(`PATCH password for user ${updatedUserId}`);
          res.body.should.have.property('updatedUser');
          res.body.updatedUser.should.have.property('id');
          res.body.updatedUser.should.have.property('email');
          res.body.updatedUser.should.have.property('phone');
          res.body.updatedUser.id.should.eql(updatedUserId);
          done();
        });
    });
    it('should not update anything, due to user id is not exist', (done) => {
      chai.request(server)
        .patch(`/users/password/${nonExistUserId}`)
        .set('Authorization', token)
        .send(validPassword)
        .end((err, res) => {
          res.should.have.status(202);
          res.body.should.have.property('message');
          res.body.message.should.eql('nothing to update');
          res.body.should.not.have.property('updatedUser');
          done();
        });
    });
    it('should not update password, due to new password is blank', (done) => {
      chai.request(server)
        .patch(`/users/password/${updatedUserId}`)
        .set('Authorization', token)
        .send(blankPassword)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message');
          res.body.should.not.have.property('updatedUser');
          done();
        });
    });
  });

  describe('DELETE /users/:id', () => {
    let deletedId = 9999;
    const nonExistUserId = 8888;
    const dummyUser = {
      email: 'dummy@yayay.com',
      name: 'dummy',
      password: 'dummy123123',
      phone: '89999999999',
    };

    before((done) => {
      // POST Dummy user
      chai.request(server)
        .post('/users/')
        .set('Authorization', token)
        .send(dummyUser)
        .end((err) => {
          if (err) {
            console.log('POST ', err);
          } else {
            // SIGN IN Dummy User to get its ID
            chai.request(server)
              .post('/users/signin')
              .set('Authorization', token)
              .send({ email: dummyUser.email, password: dummyUser.password })
              .end((error, res) => {
                if (error) {
                  console.log('SIGN IN ', error);
                } else {
                  deletedId = res.body.user.id;
                }
                done();
              });
          }
        });
    });

    it('should be delete one specific user', (done) => {
      chai.request(server)
        .del(`/users/${deletedId}`)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql(`DELETE specific user ${deletedId}`);
          done();
        });
    });

    it('should not delete specific user. Due to user id not exist', (done) => {
      chai.request(server)
        .del(`/users/${nonExistUserId}`)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(202);
          res.body.should.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('nothing to delete');
          done();
        });
    });
  });

  describe('POST /users/signin', () => {
    const validCredential = {
      email: 'laili@apa.com',
      password: 'laili1234',
    };
    const invalidEmail = {
      email: 'laixxxxxxx@apa.com',
      password: 'laili1234',
    };
    const invalidPass = {
      email: 'laili@apa.com',
      password: 'xxxxxxxxxxxxx',
    };
    const nullPass = {
      email: 'laili@apa.com',
      password: null,
    };

    it('should successfully signin', (done) => {
      chai.request(server)
        .post('/users/signin')
        .send(validCredential)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          res.body.message.should.eql('Authenticated');
          res.body.user.should.be.a('object');
          res.body.token.should.be.a('string');
          done();
        });
    });
    it('should failed signin. Due to unregistered email', (done) => {
      chai.request(server)
        .post('/users/signin')
        .send(invalidEmail)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Auth failed (No email auth)');
          done();
        });
    });
    it('should failed signin. Due to incorrect password', (done) => {
      chai.request(server)
        .post('/users/signin')
        .send(invalidPass)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('Auth failed (Incorrect password)');
          done();
        });
    });
    it('should failed signin. Due to password is blank', (done) => {
      chai.request(server)
        .post('/users/signin')
        .send(nullPass)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.be.a('string');
          done();
        });
    });
  });
});
