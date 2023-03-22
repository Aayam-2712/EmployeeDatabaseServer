
let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Methods", 
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

var port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));


const { Client } = require("pg");
const client = new Client ({
    user: "postgres",
    password: "Aayam@271298",
    database: "postgres",
    port: 5432,
    host: "db.vozbtbddnxtskdspyhza.supabase.co",
    ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
    console.log(`Connected!!!`);
});


let mysql = require("mysql");
let connData = {
    host : "localhost",
    user : "root",
    password : "",
    database : "testdb",
};

let connection = mysql.createConnection(connData);


app.get("/employees", function(req,res, next) {
    console.log("Request Query : ",req.query)
    let department = req.query.department ? req.query.department : false ;
    let designation = req.query.designation ? req.query.designation : false;
    let gender = req.query.gender ? req.query.gender : false;
    if(department&&designation&&gender) {
        let sql1 = `SELECT * FROM employees WHERE department=$1 AND designation=$2 AND gender=$3`;
        client.query(sql1, [department,designation,gender], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else if (department&&designation&&!gender) {
        let sql1 = `SELECT * FROM employees WHERE department=$1 AND designation=$2`;
        client.query(sql1, [department,designation], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else if (department&&!designation&&gender) {
        let sql1 = `SELECT * FROM employees WHERE department=$1 AND gender=$2`;
        client.query(sql1, [department,gender], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else if (!department&&designation&&gender) {
        let sql1 = `SELECT * FROM employees WHERE designation=$1 AND gender=$2`;
        client.query(sql1, [designation,gender], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else if (department&&!designation&&!gender) {
        let sql1 = `SELECT * FROM employees WHERE department=$1`;
        client.query(sql1, [department], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else if (!department&&designation&&!gender) {
        let sql1 = `SELECT * FROM employees WHERE designation=$1`;
        client.query(sql1, [designation], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else if (!department&&!designation&&gender) {
        let sql1 = `SELECT * FROM employees WHERE gender=$1`;
        client.query(sql1, [gender], function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
    else {
        let sql1 = `SELECT * FROM employees`;
        client.query(sql1, function(err, result) {
            if(err) console.log("designation : ",err);
            else res.send(result.rows);
        });
    }
});

app.get("/employee/code/:code", function(req,res, next) {
    let code = req.params.code;
    console.log(code);
    let sql = `SELECT * FROM employees WHERE empcode=$1`;
    client.query(sql, [code], function(err, result) {
        if(err) { res.status(400).send(err); }
        res.send(result.rows);
    });
});

app.get("/employee/department/:department", function(req,res, next) {
    let department = req.params.department;
    let sql = `SELECT * FROM employees WHERE department=$1`;
    client.query(sql, [department], function(err, result) {
        if(err) console.log(err);
        else res.send(result.rows);
    });
});

app.get("/employee/designation/:designation", function(req,res, next) {
    let designation = req.params.designation;
    let sql = `SELECT * FROM employees WHERE designation=$1`;
    client.query(sql, [designation], function(err, result) {
        if(err) res.send(err);
        else res.send(result);
    });
});


app.post("/employee/add", function(req,res,next) {
    var values = Object.values(req.body);
    console.log(values);
    let sql = `INSERT INTO employees (EmpCode,Name,Department,Designation,Salary,Gender) VALUES ($1,$2,$3,$4,$5,$6)`;
    client.query(sql, values, function(err, result) {
        if(err) { res.status(400).send(err) };
        res.send(`${result.rowCount} insertion successful`);
    });
});


app.put("/employee/:code", function(req, res,next) {
    let code = +req.params.code;
    let body = req.body;
    console.log(body);
    let values = [body.empcode, body.name, body.department, body.designation, body.salary, body.gender, code];
    console.log("Values",values);
    let sql1 = `UPDATE employees SET empCode=$1, name=$2, department=$3, designation=$4, salary=$5, gender=$6 WHERE EmpCode=$7`;
    client.query(sql1, values, function(err,result) {
        if(err) res.status(404).send(err);
        res.send(`${result.rowCount} Updation Successful`);
    });
});


app.delete("/employee/:code", function(req, res) {
    let code = req.params.code;
    let sql = `DELETE FROM employees WHERE empCode=$1`;
    client.query(sql, [code], function(err,result) {
        if(err) res.status(404).send(err);
        res.send(`${result.rowCount} Deleted Successful`);
    });
});


app.get("/resetData", function(req, res, next) {
    console.log("Inside get/resetData of employees");
    const query = `DELETE FROM employees`;
    client.query(query, function(err, result) {
        if(err) {
            console.log("{error} : ", err);
            res.send(err);
        }
        else {
            console.log("Successfully deleted. Affected rows : ",result);
            let {employees} = require("./employeeData.js");
            for (let i=0;i<employees.length;i++){
                let query2 = `INSERT INTO employees( empcode, name, department, designation, salary, gender ) VALUES ($1,$2,$3,$4,$5,$6)`;
                client.query(query2, [ employees[i].empCode, employees[i].name, employees[i].department, employees[i].designation, employees[i].salary, employees[i].gender ], function(err, result) {
                    if(err){
                        console.log("error : ", err);
                    }
                    else {
                        console.log("Successfully inserted. Affected rows : ",result);
                    }
                });
            }
            res.send("Successfully Reset the Data.");
        }
        
    });
});