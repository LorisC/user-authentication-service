import App from "./App";
import {config} from "./Config";

const app = new App();
app.init(config.inMemoryAdmin)
    .then(() => {
        app.startServer();
    });


