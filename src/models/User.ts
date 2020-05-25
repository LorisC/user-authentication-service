import * as bcrypt from 'bcrypt';

export class User {
    usernameHash: string;
    passwordHash: string;
    isAdmin: boolean = false;
    id: string;


    public constructor(username: string, password: string) {
        this.usernameHash = username;
        this.passwordHash = password;
    }

    toString(): string {
        return JSON.stringify({username: this.usernameHash, password: this.passwordHash})
    }

    static fromJSON(str: string): User {
        try {
            const user = JSON.parse(str);
            return new User(user.username, user.password);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    static new(username: string, password: string): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const usernameHash = username;
                const passwordHash = await bcrypt.hash(password, 10);
                resolve(new User(usernameHash, passwordHash));
            } catch (e) {
                reject(e)
            }
        });
    }

    is(username: string, password: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try{
                if (username !== this.usernameHash)
                    return resolve(false);
                return resolve(await  bcrypt.compare(password, this.passwordHash))
            }
            catch (e) {
                console.error(e);
                reject(e);
            }
        })
    }

    equals(user: User): boolean {
        return user.passwordHash === this.passwordHash
            && user.usernameHash === this.usernameHash;
    }

    async setPassword(new_password: string) {
        this.passwordHash = await bcrypt.hash(new_password, 10);
    }
}
