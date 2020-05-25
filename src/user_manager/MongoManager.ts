import {UserManager} from "./UserManager";
import {User} from "../models/User";

class  MongoManager implements UserManager{

    isValidUser(username: string, password: string): Promise<String> {
        return undefined;
    }

    saveUser(username: string, password: string): Promise<String> {
        return undefined;
    }

    getUser(username: string, password: string): Promise<User> {
        return undefined;
    }

    modifyUser(username: string, oldPassword: string, new_password: string, is_admin: boolean): Promise<boolean> {
        return undefined;
    }

    isAdmin(username: string, password: string): Promise<boolean> {
        return undefined;
    }

    init(obj: any): Promise<boolean> {
        return undefined;
    }

}
