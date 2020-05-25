import * as assert from 'assert';
import {User} from "../../src/models/User";
import * as bcrypt from "bcrypt"

const USER_PASSWORD = "password";
const USER_NAME = "username";
describe("User", () => {
    describe("#new", () => {
        it('should create a new user with username and password hash',
            function (done) {
                User.new(USER_NAME, USER_PASSWORD)
                    .then(user => {
                        bcrypt
                            .compare(USER_NAME, user.usernameHash)
                            .then(value => {
                                assert(value, "Wrong username");
                                bcrypt.compare(USER_PASSWORD, user.passwordHash)
                                    .then(val => {
                                        assert(val, "Wrong Password");
                                        done()
                                    });
                            });
                    });
            });

    });
    describe("#is", () => {
        it('should return true ', function (done) {
            User.new(USER_NAME, USER_PASSWORD)
                .then(user => {
                    user.is(USER_NAME, USER_PASSWORD)
                        .then(is => {
                            assert(is, "User parameters should be equals");
                            done()
                        })
                })
        });
    });
    describe("#equals", () => {
        it('should be same', function (done) {
            User.new(USER_NAME, USER_PASSWORD)
                .then(user => {
                    const u2 = new User(user.usernameHash, user.passwordHash);
                    assert(user.equals(u2));
                    done()
                })
        });
        it('should be different', function (done) {
            User.new(USER_NAME, USER_PASSWORD)
                .then(user => {
                    const u2 = new User(USER_NAME, USER_PASSWORD);
                    assert(!user.equals(u2));
                    done()
                })
        });
    });
    describe("#fromJSON", () => {
        it('should create a new user from json', function () {
            const json = JSON.stringify({username: USER_NAME, password: USER_PASSWORD});
            const user = User.fromJSON(json);
            assert(user.usernameHash === USER_NAME);
            assert(user.passwordHash === USER_PASSWORD);
        });
    });
    describe("#toString", () => {
        it('should create string containing a json of the object', function (done) {
            User.new(USER_NAME, USER_PASSWORD)
                .then(u => {
                    let stringUser = u.toString();
                    let userJson = JSON.parse(stringUser);
                    assert(u.passwordHash === userJson.password);
                    assert(u.usernameHash === userJson.username);
                    done();
                })
        });
    });
});
