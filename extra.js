const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const path = require('path');
const mongoose = require("mongoose");
const cookieParse = require("cookie-parser");
app.use(cors("*"));
app.use(express.json());
app.use(cookieParser());
mongoose.connect('mongodb://localhost:27017/notbook').then(() => {
    console.log("connection successful");
}).catch((err) => {
    console.log(err);
})

// image upload

const storage =multer.diskStorage({
    destination:'./upload/images',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname)) ;
    }
});

const upload = multer({ storage: storage });

app.use("/images", express.static('./upload/images'));
app.post('/upload', upload.single('image'), (req, res) => { 
    res.json({
        success: 1,
        image_url: "localhost:3000/images/" + req.file.filename})
})
    
// schema for creating product

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
  
    image:{
        type:String,
       
    },
    category:{
        type:String,
        required:true
    },
    new_price:{
        type:Number,
        required:true
    },
    old_price:{
        type:Number,
        required:true
    },
    data:{
        type:Date,
        default:Date.now
    },
    avilable:{
        type:Boolean,
        default:true
    }
    
});

const Product = mongoose.model("Product", productSchema);


// creating product

app.post("/addproduct", async (req, res) => {
   
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price
        });

        await product.save().then(() => {
            res.send("product added");
        });
        

    } catch (err) {
        res.send(err);
    }
});

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ _id: req.body._id })
    res.json({
        success: 1,
        produt_id: req.body._id
    })
})



app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.send(products);
})

// schema for creating user

const userSchema = new mongoose.Schema({
    fistname: {
        type: String,
        required: true
    },
    lastname: {
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
        fistname: req.body.fistname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
       
    });

    await user.save()

   

    const data = {
        user:{
            id:user._id 
        }
        

        }
        const token = jwt.sign(data, "secret_ecom")
        res.json({success:true, token})

    

   
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
    
    
    const token = jwt.sign({ _id: user._id }, "jwtPrivateKey");
    res.cookie("token", token );
    
    return res.send("done");
})




// app listen


app.listen(5000, () => {
    console.log("server is running on port 5000");
});




// // 2

// let dataObj2;

// let formData2 = new FormData();
// formData2.append('subjectimage', notedemopgf);

// await fetch('http://localhost:5000/upload', {
//   method: 'POST',
//   headers: {
//     Accept: 'application/json',
//   },
//   body: formData2,
// }).then((resp) => resp.json())
//   .then((data) => { dataObj2 = data });
// if (dataObj2.success) {
//   chapterdata.notefullpdf = dataObj2.image_url;
//   console.log(chapterdata);
// }


// // 3

// let dataObj3;

// let formData3 = new FormData();
// formData3.append('subjectimage', distionarydemopdf);

// await fetch('http://localhost:5000/upload', {
//   method: 'POST',
//   headers: {
//     Accept: 'application/json',
//   },
//   body: formData3,
// }).then((resp) => resp.json())
//   .then((data) => { dataObj3 = data });
// if (dataObj3.success) {
//   chapterdata.distionarydemopdf = dataObj3.image_url;
//   console.log(chapterdata);
// }



// // 4

// let dataObj4;

// let formData4 = new FormData();
// formData4.append('subjectimage', distionaryfullpdf);

// await fetch('http://localhost:5000/upload', {
//   method: 'POST',
//   headers: {
//     Accept: 'application/json',
//   },
//   body: formData3,
// }).then((resp) => resp.json())
//   .then((data) => { dataObj4 = data });
// if (dataObj4.success) {
//   chapterdata.distionaryfullpdf = dataObj4.image_url;
//   console.log(chapterdata);
// }


// slider


<Swiper
navigation={true}
modules={[Navigation]}
className="mySwiper"
>
<SwiperSlide className=" text-center">
  <div className=''>
  <div className='py-2 '>
  <h1 className='text-2xl'>Notes</h1>

  </div>

 
  </div>
</SwiperSlide>
<SwiperSlide className=" text-center">
  <div className=''>
  <div className='py-2 '>
  <h1 className='text-2xl'>Dictionary</h1>

  </div>
  <div className='py-2 flex gap-12 justify-center'>

      <button type="button" class="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Demo</button>

      <button type="button" class="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Full pdf</button>
  </div>


  </div>
</SwiperSlide>

</Swiper>



 {/* <div style={{ height: '100vh',width: '400px', border: '1px solid black' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={selectedPdf} />
          </Worker>
        </div> */}

        // onContextMenu={handleRightClick}

        // const handleRightClick = (e) => {
        //     e.preventDefault();
        //     alert('Right-click is disabled on this website.');
        //   };