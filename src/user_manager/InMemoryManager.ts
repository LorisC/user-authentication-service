import {UserManager} from "./UserManager";
import {User} from "../models/User";
import * as fs from 'fs';

interface Admin {
    username: string,
    password: string
}

export class InMemoryManager implements UserManager {

    path: string;
    users: User[] = [];


    constructor(path: string) {
        this.path = path;
    }

    async init(admin: Admin) {
        if (fs.existsSync(this.path)) {
            this.loadUsers();
            return true;
        }

        await this.saveUser(admin.username, admin.password, true);
        console.log("init", admin);
        return true;
    }

    modifyUser(username: string, oldPassword: string, new_password: string, is_admin: boolean = false): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let find = false;
            for (let i = 0; i < this.users.length; i++) {
                if (await this.users[i].is(username, oldPassword)) {
                    await this.users[i].setPassword(new_password);
                    this.users[i].isAdmin = is_admin;
                    find = true;
                    break;
                }
            }
            if (find)
                this.rewriteDataBase()
                    .then(resolve)
                    .catch(reject);
            else
                resolve(false);
        });
    }

    getUser(username: string, password: string): Promise<User> {
        return new Promise(async (resolve, rejects) => {
            try {
                for (let usr of this.users) {
                    if (await usr.is(username, password))
                        return resolve(usr);
                }
                return resolve(null);
            } catch (e) {
                rejects(e);
            }
        })
    }

    saveUser(username: string, password: string, is_admin: boolean = false): Promise<String> {
        return new Promise(async (resolve, reject) => {
            try {
                let exist = await this.exist(username, password);
                if (exist !== null)
                    return resolve(null);

                const user = await User.new(username, password);
                let data;
                if (fs.existsSync(this.path)) {
                    //TODO replace by append
                    data = fs.readFileSync(this.path, 'utf8');
                }
                data += `\n ${user.toString()}`;

                fs.writeFile(this.path, data,
                    (e) => {
                        if (e)
                            return reject(e);
                        user.id = this.users.length.toString();
                        user.isAdmin = is_admin;
                        this.users.push(user);
                        return resolve(user.id)
                    },);
            } catch (e) {
                return reject(e);
            }
        })
    }

    isValidUser(username: string, password: string): Promise<String> {
        return new Promise(async (resolve, reject) => {
            this.exist(username, password)
                .then((exist) => {
                    if (exist)
                        return resolve(this.users[parseInt(exist)].id);

                    return this.loadUsers()
                        .then(async () => {
                            let exist = await this.exist(username, password);
                            if (exist !== null)
                                return resolve(this.users[parseInt(exist)].id);
                            return resolve(null);
                        })
                        .catch(e => {
                            return reject(e)
                        })
                })
                .catch(e => {
                    return reject(e)
                })
        })
    }

    loadUsers(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.path, {encoding: 'utf8', flag: 'a+'}, (error, data) => {
                if (error)
                    return reject(error);

                const users: User[] = [];
                console.log("loaded user", data);
                const stringUser = data.split('\n');
                for (let str of stringUser) {
                    if (str.length > 0)
                        users.push(User.fromJSON(str))
                }
                this.users = users;
                return resolve();
            })
        })
    }

    exist(username: string, password: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                for (let usr of this.users) {
                    if (await usr.is(username, password))
                        return resolve(usr.id);
                }
                return resolve(null);
            } catch (e) {
                return reject(e);
            }
        })
    }

    rewriteDataBase(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(this.path))
                fs.unlinkSync(this.path);
            let data = "";
            for (let usr of this.users){
                data+= "\n" + usr.toString();
            }
            fs.writeFile(this.path, data,
                {flag: 'w+', encoding: 'utf8'},
                (e) => {
                    if (e)
                        return reject(e);
                    return resolve(true)
                },);
        })
    }

    async isAdmin(username: string, password: string): Promise<boolean> {
        let admin = await this.getUser(username, password);

        if (admin !== null)
            return admin.isAdmin;
        else return false
    }

}
