const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const bcrypt = require('bcrypt');

const should = chai.should();
const { expect } = chai;
const db = require('../database');

const users = require('../api/routes/users');

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDY4LCJlbWFpbCI6ImxhaUBhcGEuY29tIiwibmFtZSI6ImxhaWxpIiwicGhvbmUiOiIxMTIyMzMzMzIyMTEiLCJpYXQiOjE1MzQwMjEyODYsImV4cCI6MTUzNDEwMDQ4Nn0.mFJEy25-ypy3UCeyakUwFvH5nsCeFM7ky-DfIl6gm_o';
const invalidToken = 'Bearer xyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsImVtYWlsIjoibGFpbGlAYXBhLmNvbSIsIm5hbWUiOiJsYWlsaSBmYXpyaSBwcmliYWRpIiwicGhvbmUiOiI5MDkwOTA5MCIsImlhdCI6MTUzMzM2NjU5NiwiZXhwIjoxNTMzMzcwMTk2fQ.b9XbKeddwyjao3DPhqvkxUDugANSBLT4jRC0AyGEpHk';

chai.use(chaiHttp);

describe('USERS', () => {
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
        .set('Authorization', token)
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
          console.log("err select: ",err);
        } else {
          lastID = row.ID;
          // delete latest ID
          stmt = 'DELETE FROM USERS WHERE ID = ? ';
          db.run(stmt, lastID, (err, row) => {
            if (err) {
              console.log("err delete: ", err);
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
        })
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
        })
    })

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
    })
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
        })
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
        })
    });

  });

  describe('PATCH /users/:id', () => {
    const updatedUserId = 16;
    const nonExistUserId = 99999;
    const updatedUser = {
      email: 'new123@yayay.com',
      name: 'new',
      password: 'satu123123',
      phone: '01018181818',
    };
    const invalidUpdatedUser = {
      email: 'new123@yayay.com',
      name: 'new',
      password: null,
      phone: '01018181818',
    };
    const nullUpdatedUser = {
      email: null,
      name: 'new',
      password: 'aaaaaaaaa12123',
      phone: '01018181818',
    };
    let passwordCompare = false;

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
          bcrypt.compare(updatedUser.password, res.body.updatedUser.password, (err, result) => {       
            passwordCompare = result;
            passwordCompare.should.eql(true);
          });
          const expectedUpdatedUser = Object.assign({}, updatedUser.email, updatedUser.name, updatedUser.phone);
          const actualUpdatedUser = Object.assign({}, res.body.updatedUser.email, res.body.updatedUser.name, res.body.updatedUser.phone);

          JSON.stringify(actualUpdatedUser).should.eql(JSON.stringify(expectedUpdatedUser));
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

    it('should not update user. Due to password is blank', (done) => {
      chai.request(server)
        .patch(`/users/${updatedUserId}`)
        .set('Authorization', token)
        .send(invalidUpdatedUser)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.be.a('string');
          done();
        })
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
        })
    });

  });

  describe('DELETE /users/:id', () => {
    let deletedId = 9999;
    let nonExistUserId = 8888;
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
        .end((err, res) => {
          if (err) {
            console.log("POST ", err);
          } else {
            // SIGN IN Dummy User to get its ID
            chai.request(server)
              .post('/users/signin')
              .set('Authorization', token)
              .send({ email: dummyUser.email, password: dummyUser.password })
              .end((err, res) => {
                if (err) {
                  console.log("SIGN IN ", err);
                } else {
                  deletedId = res.body.user.id;
                }
                done();
              });
          }
        });
    })

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
      "email": "lai@apa.com",
      "password": "laili1234"
    };
    const invalidEmail = {
      "email": "laixxxxxxx@apa.com",
      "password": "laili1234"
    };
    const invalidPass = {
      "email": "lai@apa.com",
      "password": "xxxxxxxxxxxxx"
    }
    const nullPass = {
      "email": "lai@apa.com",
      "password": null
    }

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