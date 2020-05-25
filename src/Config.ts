import program from "./CommandParser";
import {SUPPORTED_DATABASE} from "./user_manager/UserManager";
import {ADMIN_NAME, ADMIN_PASSWORD, IN_MEMORY_DB_PATH, PORT} from "./Constants";

export const config = {
    providerType: program.provider || SUPPORTED_DATABASE.IN_MEMORY,
    user: {
        host: program.user,
        password: program.password
    },
    dbPath: program.F || IN_MEMORY_DB_PATH,
    port: program.port || PORT,
    inMemoryAdmin: {
        username: program.admin || ADMIN_NAME,
        password: program.adminPassword || ADMIN_PASSWORD
    }
};
