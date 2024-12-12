const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require('path');
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { subscribe } = require("diagnostics_channel");
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
app.use(cors("*"));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/notbook').then(() => {
    console.log("connection successful");
}).catch((err) => {
    console.log(err);
})

// waterpark

async function addWatermarkToUploadedFile(inputPath, outputPath, watermarkText) {
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 4,
        y: height / 2,
        size: 50,
        color: rgb(0.95, 0.1, 0.1),
        rotate: { degrees: 45 },
      });
    });

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedPdfBytes);
    console.log('Watermark added successfully');
  }
  

// image upload

const storagenew =multer.diskStorage({
    destination:'./upload/images',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname)) ;
    }
});

const uploadnew = multer({ storage: storagenew });

app.use("/images", express.static('./upload/images'));
app.post('/upload1', uploadnew.single('subjectdata'),async (req, res) => { 
    console.log(req.files);
    console.log(req.body);
   

    
  return  res.json({
        success: 1,
        image_url: "http://localhost:5000/images/" + req.file.filename})
})





// image upload


const storage =multer.diskStorage({
    destination:'./upload/images',
    filename: (req, file, cb) => {
      return  cb(null,file.originalname + '-' + Date.now() + path.extname(file.originalname))
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf/; // Allowed file types
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimeType = allowedTypes.test(file.mimetype);
  
      if (extname && mimeType) {
        return cb(null, true);
      } else {
        cb(new Error('Only images or PDFs are allowed!'));
      }

    },
  });


app.post('/upload', upload.array('subjectimage',4),async (req, res) => { 
    
    const allchapters= await Subject.find();

    const data= JSON.parse(req.body.chaterdata) ;
    const chapter=allchapters.filter((item)=> item.name == data.subjectname);
        
console.log(chapter);


    const newdata={
        name:data.name,
        subjectname:data.subjectname,
        notedemopgf:req.files[0].filename,
        notefullpdf:req.files[1].filename,
        distionarydemopdf:req.files[2].filename,
        distionaryfullpdf:req.files[3].filename

    }
   
    

    chapter[0].chapaters.push(newdata);

    await chapter[0].save();
    
  
    const inputPath = path.join(__dirname, 'uploads', req.file.filename);
    const outputPath = path.join(__dirname, 'watermarked', req.file.filename);
  
    await addWatermarkToUploadedFile(inputPath, outputPath, 'Confidential');
    res.send(`File uploaded and watermarked: ${req.file.filename}`);


  return  res.json({
        success: 1,
        image_url: "http://localhost:5000/images/" + req.files[0].filename})


        
})




// craete subject schema
const subjectSchema = new mongoose.Schema({
    name:{
        type:String,
        
    },
    description:{
        type:String,
        
    },
  
    image:{
        type:String,
       
    },
    chapaters:[]
   
});

const Subject = mongoose.model("Subject", subjectSchema);

app.post('/createsubject', async (req, res) => {
    const subject = new Subject({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        
    });

    await subject.save()
   return res.json({success:true})
})  




app.get('/subjects', async (req, res) => {
    const subjects = await Subject.find();
    
   return res.send(subjects);
   
    
})
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    next();
  });


// Razorpay

const razorpay = new Razorpay({
    key_id: "rzp_test_r5JK3GVo92vEPm", // Replace with your Razorpay Key ID
    key_secret: "ZNoTWuTDMj7Svw0eJr501VDl", // Replace with your Razorpay Secret
});

// Create Order Endpoint
app.post("/create-order", async (req, res) => {
    const amount = 49900; // Amount in Ruppes (₹499 = 49900 Ruppes)

    try {
        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});

// Webhook Endpoint (optional for server validation)
app.post("/webhook", (req, res) => {
    // Razorpay webhook implementation here
    console.log(req.body);
    res.status(200).send("OK");
});

// schema for creating user

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subscribed: {
        type: Boolean,
        default: false
        
    },
    cartData:[],
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", userSchema);

app.post('/signup', async (req, res) => {
    const check = await User.findOne({ email: req.body.email });
    if(check){
        return res.send('user already exist')
    }

   
try {
    const user = new User({
        username: req.body.username,
       
        email: req.body.email,
        password: req.body.password,
       
    });

    await user.save()
    const data = {
        user:{
            id:user._id 
        }
        }
        const usertoken = jwt.sign(data, "secret_ecom")
        res.json({success:true, usertoken}) 
} catch (error) {
    console.log(error);    
}
})

app.post('/login', async (req, res) => {
    const {password, email}=req.body
    const user = await User.findOne({ email: email});
    if (!user) {
        return res.status(400).json({
            success: 0,
            message: "email not exist"
        })

    }


    if (password !== user.password) {
        return res.status(400).json({
            success: 0,
            message: "wrong password"
        })
    }
    
    
    const usertoken = jwt.sign({ _id: user._id }, "jwtPrivateKey");
    res.cookie("usertoken", usertoken );
    res.send({success:true, usertoken})
    
})




// app listen


app.listen(5000, () => {
    console.log("server is running on port 5000");
});


