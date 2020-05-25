import * as assert from 'assert';
import {InMemoryManager} from "../../src/user_manager/InMemoryManager";
import {User} from "../../src/models/User";
import * as fs from 'fs';
import * as path from 'path'
import {ADMIN_NAME, ADMIN_PASSWORD} from "../../src/Constants";
import {expect} from 'chai';


const TEST_DB_PATH = "../../testFile";
const MemoryPath = path.join(__dirname, "memory.txt");

const USER_PASSWORD_1 = "password";
const USER_NAME_1 = "bob";

const USER_PASSWORD_2 = "pass0d";
const USER_NAME_2 = "lo";
const ADMIN = {username: ADMIN_NAME, password: ADMIN_PASSWORD};

describe('InMemoryProvider', () => {
    let inMemoryManager: InMemoryManager;


    beforeEach((done) => {
        if (fs.existsSync(TEST_DB_PATH))
            fs.unlinkSync(TEST_DB_PATH);
        inMemoryManager = new InMemoryManager(TEST_DB_PATH);
        inMemoryManager
            .init(ADMIN)
            .then(() => {
                done();
            })
    });

    describe("#saveUser", () => {
        it('should write a user into the db', function (done) {
            inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1)
                .then(u1 => {
                    assert(u1 !== null, "inMemoryManager should have save the user");
                    fs.readFile(TEST_DB_PATH, 'utf8', (e, data) => {
                        assert(e === null);
                        let users = data.split('\n');
                        assert(users.length === 3);
                        done()
                    });
                })
                .catch(e => {
                    assert(e === null);
                    done()
                })
        });

        it('should write two user into the db', async function () {

            let id1 = await inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1);
            let id2 = await inMemoryManager.saveUser(USER_NAME_2, USER_PASSWORD_2);

            assert(id1 !== null, 'id1 should be not null');
            assert(id2 !== null, 'id2 should be not null');
        });
    });
    describe("#isValidUser", () => {
        it('should return true for a valid username password', function (done) {
            inMemoryManager
                .saveUser(USER_NAME_1, USER_PASSWORD_1)
                .then(() => {
                    inMemoryManager
                        .isValidUser(USER_NAME_1, USER_PASSWORD_1)
                        .then(exist => {
                            assert(exist !== null);
                            done();
                        })
                })
        });

        it('should return false for an invalid username password', function (done) {
            inMemoryManager
                .saveUser(USER_NAME_1, USER_PASSWORD_1)
                .then(() => {
                    inMemoryManager
                        .isValidUser(USER_PASSWORD_1, USER_PASSWORD_1)
                        .then(exist => {
                            assert(exist === null);
                            done()
                        })
                })

        });
    });
    describe("#loadUser", () => {
        it('should load the user of the file', async function () {
            inMemoryManager = new InMemoryManager(MemoryPath);
            assert(inMemoryManager.users.length === 0);
            await inMemoryManager.loadUsers();
            // @ts-ignore
            assert(inMemoryManager.users.length === 1)
        });
        it('should be able to load user after storing them', async function () {

            await inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1);
            await inMemoryManager.saveUser(USER_NAME_2, USER_PASSWORD_2);
            await inMemoryManager.loadUsers();

            assert(inMemoryManager.users.length === 3, "it should have 3 user the admin and the two registered in the test")
        });
    });
    describe("#exist", () => {
        it('should return true', async function () {
            await inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1);
            let exit = await inMemoryManager.exist(USER_NAME_1, USER_PASSWORD_1);
            assert(exit !== null);
        });
        it('should return false', async function () {
            await inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1);
            let exit = await inMemoryManager.exist(USER_PASSWORD_1, USER_PASSWORD_1);
            assert(exit === null);
        });
    });
    describe("#getUser", () => {
        it('should return the admin', function (done) {
            inMemoryManager
                .getUser(ADMIN_NAME, ADMIN_PASSWORD)
                .then(u => {
                    expect(u).to.not.be.null;
                    expect(u.isAdmin).to.be.true;
                    done()
                })
                .catch(e => {
                    console.error(e);
                    expect(e).to.be.null;
                    done()
                })
        });

        it('should return the user 1', async function () {
            await inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1);
            let user = await inMemoryManager
                .getUser(USER_NAME_1, USER_PASSWORD_1);
            expect(user).to.not.be.null;
            expect(user.isAdmin).to.be.false;

        });

        it('should return the admin', async function () {
            await inMemoryManager.saveUser(USER_NAME_1, USER_PASSWORD_1);
            let admin = await inMemoryManager.getUser(ADMIN_NAME, ADMIN_PASSWORD);
            expect(admin).to.not.be.null;
            expect(admin.isAdmin).to.be.true;
        });
    });

    describe("#isAdmin", () => {
        it('should return true with the good credentials', async function () {
            expect(await inMemoryManager.isAdmin(ADMIN_NAME, ADMIN_PASSWORD)).to.be.eq(true)
        });
        it('should return false with the bad credentials', async function () {
            expect(await inMemoryManager.isAdmin(USER_PASSWORD_1, USER_PASSWORD_1)).to.be.eq(false)
        });

    })

});

