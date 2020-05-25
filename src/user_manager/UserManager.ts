import {User} from "../models/User";



export enum SUPPORTED_DATABASE {
    IN_MEMORY = "InMemory",
    MONGODB = "MongoDB"
}

export interface UserManager {
    isValidUser(username: string, password: string): Promise<String>;
    getUser(username: string, password: string): Promise<User>;
    saveUser(username: string, password: string, is_admin:boolean ) : Promise<String>;
    modifyUser(username: string, oldPassword: string, new_password: string, is_admin: boolean): Promise<boolean>;
    isAdmin(username: string, password: string):Promise<boolean>;
    init(obj: any): Promise<boolean>;
}
