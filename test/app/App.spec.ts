import assert = require("assert");

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
import UserAuthenticationService from "../../src/App";
import {Express} from "express";
import {ADMIN_NAME, ADMIN_PASSWORD} from "../../src/Constants";
import * as fs from "fs";

const USER_NAME: string = "loris";
const USER_PASSWORD: string = "password";
const NEW_PASSWORD: string = " new password";
const ADMIN = {username: ADMIN_NAME, password: ADMIN_PASSWORD};

chai.use(chaiHttp);
describe("API", () => {
    let app: Express;
    let userAuthenticationService: UserAuthenticationService;

    function login( username: string, password: string,done: any, eq: any) {
        chai.request(app)
            .post('/login')
            .type('form')
            .send({
                username: username,
                password: password
            })
            // @ts-ignore
            .end((err, res) => {
                expect(err).to.be.null;
                // @ts-ignore
                expect(res).to.have.status(200);
                expect(res.body.isValid).to.be.eq(eq);
                done()
            })
    }

    beforeEach(
        async () => {
            userAuthenticationService = new UserAuthenticationService();
            if (fs.existsSync(userAuthenticationService.inMemoryPath))
                fs.unlinkSync(userAuthenticationService.inMemoryPath);

            await userAuthenticationService.init(ADMIN);
            app = userAuthenticationService.app;
        }
    );
    describe("/user", () => {
        it('should return the id of the new user', function (done) {
            // @ts-ignore
            chai.request(app)
                .post('/user')
                .type('form')
                .send({
                    username: "loris",
                    password: "password"
                })
                // @ts-ignore
                .end((err, res) => {
                    expect(err).to.be.null;
                    // @ts-ignore
                    expect(res).to.have.status(200);
                    expect(res).to.not.be.null;

                    done()
                })
        });
    });

    describe("/login", () => {
        it('should return the id of the  user', function (done) {
            userAuthenticationService.userManager.saveUser(USER_NAME, USER_PASSWORD, false).then(id => {
                login(USER_NAME, USER_PASSWORD,done, id);
            });

        });
    });

    describe('/modifyUser', () => {
        it('should modify the user', function (done) {
            userAuthenticationService.userManager.saveUser(USER_NAME, USER_PASSWORD, false)
                .then(id => {
                    // @ts-ignore
                    chai.request(app)
                        .post('/modifyUser')
                        .type('form')
                        .send({
                            username: USER_NAME,
                            old_password: USER_PASSWORD,
                            new_password: NEW_PASSWORD,
                            adminUserName: ADMIN.username,
                            adminPassword: ADMIN.password,
                        })
                        // @ts-ignore
                        .end((err, res) => {
                            expect(err).to.be.null;
                            expect(res).to.have.status(200);
                            expect(res.body.modified).to.be.eq(true);
                            login(USER_NAME, NEW_PASSWORD, done, id);
                        })
                }).catch(e => {
                console.error(e);
                assert(e === null);

            })
        });
    })
});
