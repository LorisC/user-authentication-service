import * as express from "express"
import {Express} from "express"
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import {UserManager, SUPPORTED_DATABASE} from "./user_manager/UserManager";
import {config} from './Config'
import {InMemoryManager} from "./user_manager/InMemoryManager";
import * as fs from 'fs';

export default class UserAuthenticationService {
    public app: Express;
    public name: String = "User Authentication Service";
    public port: string = config.port;
    public providerType: SUPPORTED_DATABASE = config.providerType;
    public userManager: UserManager;
    public inMemoryPath: string = config.dbPath;

    async init(admin: any) {
        switch (this.providerType) {
            case SUPPORTED_DATABASE.IN_MEMORY:
                this.userManager = new InMemoryManager(this.inMemoryPath);
                break;
            case SUPPORTED_DATABASE.MONGODB:
                process.exit(1);
                break;
            default:
                this.userManager = new InMemoryManager(this.inMemoryPath);
                break;
        }

        await this.userManager.init(admin || config.inMemoryAdmin);

        this._initExpress();
    }

    _initExpress() {
        this.app = express();
        this.app.use(morgan('tiny'));
        this.app.use(bodyParser.json()); // support json encoded bodies
        this.app.use(bodyParser.urlencoded({extended: true}));
        this._initRoute();
    }

    _initRoute() {
        this.app.post('/login', (req, res) => {
            let {username, password} = req.body;
            this.userManager
                .isValidUser(username, password)
                .then(isValid => {
                    return res.status(200).json({isValid});
                })
                .catch(error => {
                    return res.status(500).json(error)
                })
        });

        this.app.post('/user', (req, res) => {
            let {username, password, is_admin} = req.body;
            this.userManager.saveUser(username, password, is_admin || false)
                .then(saved => {
                    return res.status(200).json({saved});
                })
                .catch(error => {
                    return res.status(500).json(error)
                })
        });

        this.app.post('/modifyUser', async (req, res) => {
            try {
                const {adminUserName, adminPassword, username, old_password, new_password, is_admin} = req.body;
                const isAdmin =await this.userManager.isAdmin(adminUserName, adminPassword);

                if (!isAdmin)
                    return res.status(403).json({error: "Only an admin can use this route"});
                const modified = await this.userManager.modifyUser(username, old_password, new_password, is_admin || false);
                return res.status(200).json({modified});
            } catch (e) {
                return res.status(500).json({error: e});
            }
        });

        this.app.post('/appe', async (req, res)=>{
           fs.appendFile('./lors', req.body.data, {flag:'a+', encoding: 'utf8'}, ()=>{
               res.json({ok:"ok"})
           })
        });
    }

    startServer() {
        this.app.listen(this.port, () => {
            console.log(`${this.name} listen on port: ${this.port}`)
        });
    }
}
