import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "Password",
    database: "hotel_management"
}).promise();

export const authentication = (req, res, next) => {
    req.session.mail ? next() : res.render('user/home', { user: "" });
};

export const getHome = (req, res) => {
    res.render('user/home', { user: req.session.mail || "" });
};

export const getLogin = (req, res) => {
    res.render('user/loginAccount', { user: "", msg: [], err: [] });
};

export const postLogin = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM user WHERE email = ?", [req.body.mail]);
        if (results.length && bcrypt.compareSync(req.body.pass, results[0].password)) {
            req.session.mail = results[0].email;
            res.render('user/home', { user: results[0].email });
        } else {
            res.render('user/loginAccount', { user: "", msg: [], err: ["Invalid Email or Password"] });
        }
    } catch (err) {
        res.status(500).send("Database Error");
    }
};

export const getCreateAccount = (req, res) => {
    res.render('user/createAccount', { user: "", msg: [], err: [] });
};

export const postCreateAccount = async (req, res) => {
    if (req.body.pass !== req.body.con_pass) {
        return res.render("user/createAccount", { user: "", msg: [], err: ["Passwords do not match"] });
    }
    try {
        const hashedPassword = bcrypt.hashSync(req.body.pass, 10);
        await pool.query("INSERT INTO user (name, email, phone, password) VALUES (?, ?, ?, ?)", 
            [req.body.name, req.body.mail, req.body.phone, hashedPassword]);
        res.render('user/loginAccount', { user: "", msg: ["Account Created Successfully"], err: [] });
    } catch (err) {
        res.status(500).send("Database Error");
    }
};

export const getCategory = (req, res) => {
    res.render('user/category', { user: req.session.mail });
};

export const postCategory = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM category WHERE name = ? AND type = ? AND available > 0", 
            [req.body.cat, req.body.type]);
        res.render('user/showCategory', { user: req.session.mail, rooms: results });
    } catch (err) {
        res.status(500).send("Database Error");
    }
};

export const postBooking = (req, res) => {
    res.render('user/bookingConfirm.ejs', {
        user: req.session.mail,
        name: req.body.name,
        type: req.body.type,
        cost: req.body.cost
    });
};

export const postStatus = async (req, res) => {
    try {
        await pool.query("INSERT INTO bookingstatus (email, name, type, roomWant, status, date) VALUES (?, ?, ?, ?, 0, ?)", 
            [req.session.mail, req.body.name, req.body.type, req.body.roomWant, req.body.date]);
        getShowStatus(req, res);
    } catch (err) {
        res.status(500).send("Database Error");
    }
};

export const getShowStatus = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM bookingstatus WHERE email = ?", [req.session.mail]);
        results.forEach(r => r.date = r.date.toString().slice(0, 15));
        res.render('user/statusShow', { user: req.session.mail, msg: "", err: results.length ? "" : "No bookings found", data: results });
    } catch (err) {
        res.status(500).send("Database Error");
    }
};

export const deleteBooking = async (req, res, next) => {
    try {
        await pool.query("DELETE FROM bookingstatus WHERE email = ? AND type = ? AND category = ? AND roomWant = ?", 
            [req.body.mail, req.body.type, req.body.cat, req.body.want]);
        next();
    } catch (err) {
        res.status(500).send("Database Error");
    }
};

export const getContact = (req, res) => {
    res.render('user/contact', { user: req.session.mail || "" });
};

export const logout = (req, res) => {
    req.session.destroy();
    res.render('user/home', { user: "" });
};
