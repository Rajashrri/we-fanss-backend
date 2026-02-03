const express = require("express");
const router = express.Router();
const Employee = require("../controllers/employee-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//employee feature
router.route("/addemployee").post(Employee.addemployee);
router.route("/getdataemployee").get(Employee.getdata);
router.route("/getemployeeByid/:id").get(Employee.getemployeeByid);
router.route("/updateemployee/:id").patch(Employee.updateemployee);

router.route("/deleteemployee/:id").delete(Employee.deleteemployee);
router.route("/update-statusemployee").patch(Employee.updateStatus);
router.route("/getRoleOptionsTable").get(Employee.getRoleOptionsTable);

router.route("/categoryOptions").get(Employee.categoryOptions);




router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))

    const storage = multer.diskStorage({
        destination: function(req,file, cb){
        if(!fs.existsSync("public")){
            fs.mkdirSync("public");
        }
        if(!fs.existsSync("public/allimages")){
            fs.mkdirSync("public/allimages");
        }
    
        cb(null, "public/allimages");
        },
        filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname);
        },
    });
  
    const upload = multer({
        storage:storage,
    })







module.exports = router;