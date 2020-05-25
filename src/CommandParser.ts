// @ts-ignore
import {program} from 'commander';
import {SUPPORTED_DATABASE} from "./user_manager/UserManager";
import {ADMIN_NAME, ADMIN_PASSWORD, IN_MEMORY_DB_PATH, PORT} from "./Constants";

interface config {
    provider: String
}

program
    .option('-d, --database-type <type>',
        `type off data database supported types: ${SUPPORTED_DATABASE}`)
    .option("-u, --user <user>",
        "username to connect to the database")
    .option('-f <path>, --file <path>', "path to the file for the inMemory provider")
    .option("-p, --password <password>", "password to connect to the database")
    .option("--port", "port for the server to listen")
    .option("-h, --help", "display help for this program")
    .option('-a, --admin', "username of the admin account")
    .option('--admin-password', "password of admin account");

program.parse(process.argv);

export default program


