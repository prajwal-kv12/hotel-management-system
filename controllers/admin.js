import mysql from 'mysql';
import formidable from 'formidable';
import path from 'path';

// MySQL Connection Configuration
const connectDB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Password",
    database: "hotel_management"
});

// Login GET request
export const getLogin = (req, res) => {
    if (!req.session.admin) {
        return res.render('admin/login', { msg: "", err: "" });
    }
    
    const query = "SELECT * FROM bookingstatus WHERE status = 0";
    connectDB.query(query, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.render('admin/login', { msg: "", err: "Database Error" });
        }
        result.forEach(row => row.date = row.date.toString().slice(0, 15));
        res.render('admin/index', { msg: "", err: "", data: result });
    });
};

// Login POST request
export const postLogin = (req, res) => {
    const query = `SELECT * FROM admin WHERE name = ${mysql.escape(req.body.name)} AND pass = ${mysql.escape(req.body.pass)}`;
    const query2 = "SELECT * FROM bookingstatus WHERE status = 0";

    connectDB.query(query, (err, result) => {
        if (err) {
            console.error("Login Error:", err);
            return res.render('admin/login', { msg: "", err: "Database Error" });
        }

        if (result.length) {
            req.session.admin = result[0].name;
            connectDB.query(query2, (err2, result2) => {
                if (err2) {
                    console.error("Booking Fetch Error:", err2);
                    return res.render('admin/index', { msg: "", err: "Database Error", data: [] });
                }
                result2.forEach(row => row.date = row.date.toString().slice(0, 15));
                res.render('admin/index', { msg: "", err: "", data: result2 });
            });
        } else {
            res.render('admin/login', { msg: "", err: "Invalid Credentials" });
        }
    });
};

// Change booking status
export const postChangeStatus = (req, res) => {
    let query;
    if (req.body.click === "Approve") {
        query = `UPDATE bookingstatus SET status = 1 WHERE email = ${mysql.escape(req.body.mail)}
                AND type = ${mysql.escape(req.body.type)} 
                AND category = ${mysql.escape(req.body.cat)}
                AND roomWant = ${mysql.escape(req.body.want)}`;
    } else {
        query = `DELETE FROM bookingstatus WHERE email = ${mysql.escape(req.body.mail)}
                AND type = ${mysql.escape(req.body.type)} 
                AND category = ${mysql.escape(req.body.cat)}
                AND roomWant = ${mysql.escape(req.body.want)}`;
    }

    const fetchQuery = "SELECT * FROM bookingstatus WHERE status = 0";
    connectDB.query(query, (err) => {
        if (err) {
            console.error("Status Update Error:", err);
            return res.render('admin/index', { msg: "", err: "Database Error", data: [] });
        }
        connectDB.query(fetchQuery, (err2, result) => {
            if (err2) {
                console.error("Fetch Error:", err2);
                return res.render('admin/index', { msg: "", err: "Database Error", data: [] });
            }
            result.forEach(row => row.date = row.date.toString().slice(0, 15));
            res.render('admin/index', { msg: "Status Updated", err: "", data: result });
        });
    });
};

// Get Add Hotel page
export const getAddHotel = (req, res) => {
    res.render('admin/addhotel', { msg: "", err: "" });
};

// Post Add Hotel
export const postAddHotel = (req, res) => {
    let cat = "", type = "", cost = 0, avlvl = 0, des = "", imgPath = "";
    let wrong = false;

    new formidable.IncomingForm().parse(req)
        .on('field', (name, field) => {
            if (name === "cat") cat = field;
            else if (name === "type") type = field;
            else if (name === "cost") cost = parseInt(field);
            else if (name === "avlvl") avlvl = parseInt(field);
            else if (name === "des") des = field;
        })
        .on('fileBegin', (name, file) => {
            const fileType = file.type.split('/').pop();
            if (['jpg', 'png', 'jpeg'].includes(fileType)) {
                const basePath = path.join(process.cwd(), 'public/assets/img/rooms/');
                imgPath = `/assets/img/rooms/${cat + type + cost}.${fileType}`;
                file.path = `${basePath}${cat + type + cost}.${fileType}`;
            } else {
                wrong = true;
                res.render('admin/addhotel', { msg: "", err: "Invalid File Type" });
            }
        })
        .on('end', () => {
            if (wrong) return;

            const query = `INSERT INTO category(name, type, cost, available, img, dec)
                          VALUES(${mysql.escape(cat)}, ${mysql.escape(type)}, ${mysql.escape(cost)}, 
                                 ${mysql.escape(avlvl)}, ${mysql.escape(imgPath)}, ${mysql.escape(des)})`;

            connectDB.query(query, (err) => {
                if (err) {
                    console.error("Insert Error:", err);
                    return res.render('admin/addhotel', { msg: "", err: "Database Error" });
                }
                res.render('admin/addhotel', { msg: "Hotel Added Successfully", err: "" });
            });
        });
};

// Get Search Page
export const getSearch = (req, res) => {
    res.render('admin/search', { msg: "", err: "" });
};

// Post Search
export const postSearch = (req, res) => {
    const query = `SELECT * FROM category WHERE name = ${mysql.escape(req.body.cat)}`;
    connectDB.query(query, (err, result) => {
        if (err) {
            console.error("Search Error:", err);
            return res.render('admin/search', { msg: "", err: "Database Error" });
        }
        res.render('admin/update', { msg: "", err: "", data: result });
    });
};

// Get Update Page
export const getUpdate = (req, res) => {
    const query = `SELECT * FROM category WHERE name = ${mysql.escape(req.body.cat)}
                   AND type = ${mysql.escape(req.body.type)}
                   AND cost = ${mysql.escape(req.body.cost)}`;
    connectDB.query(query, (err, result) => {
        if (err) {
            console.error("Update Fetch Error:", err);
            return res.render('admin/updatePage', { msg: "", err: "Database Error" });
        }
        req.session.info = result[0];
        res.render('admin/updatePage', { data: result[0] });
    });
};

// Update Previous Data
export const updatePrevData = (req, res) => {
    const query = `UPDATE category SET type = ${mysql.escape(req.body.type)},
                                      cost = ${mysql.escape(parseInt(req.body.cost))},
                                      available = ${mysql.escape(parseInt(req.body.avlvl))},
                                      dec = ${mysql.escape(req.body.des)}
                  WHERE name = ${mysql.escape(req.session.info.name)}
                  AND type = ${mysql.escape(req.session.info.type)}
                  AND cost = ${mysql.escape(parseInt(req.session.info.cost))}`;

    connectDB.query(query, (err) => {
        if (err) {
            console.error("Update Error:", err);
            return res.render('admin/search', { msg: "", err: "Database Error" });
        }
        res.render('admin/search', { msg: "Update Successful", err: "" });
    });
};

// Logout
export const logout = (req, res) => {
    req.session.destroy();
    res.render('admin/login', { msg: "", err: "" });
};
// auto-refresh
// auto-refresh
