import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import { fileURLToPath } from 'url';
import userRouter from './routes/user.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: false
    })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));

app.use(userRouter);
app.use("/admin", adminRouter);

app.listen(3000, () => console.log("Server is Running..."));
// auto-refresh
// auto-refresh
