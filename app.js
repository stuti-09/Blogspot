const express= require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const mongoose  = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');

const MONGODB_URI =
`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.wsgvg.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });


const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
      cb(null,'images');
    },
    filename: (req,file,cb)=>{
      cb(null, new Date().toDateString()+'-'+file.originalname);
    }
  });
  const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
      cb(null,true)
    } else {
      cb(null, false);
    }
  };

app.use(multer({ storage:fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));


require('dotenv').config();
app.set('view engine','ejs');
app.set('views','views');
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout','./layouts/main');
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(session({
    secret:'BlogspotSecretSession',
    saveUninitialized: false,
    resave:false,
    store: store
}));
app.use(flash());
app.use(fileUpload());

const feedroutes = require('./routes/feed');
const authroutes = require('./routes/auth');
const { Mongoose } = require('mongoose');
app.use('/',authroutes);
app.use('/',feedroutes);
mongoose
.connect(MONGODB_URI)
.then(result =>{
  app.listen(process.env.PORT || 8000);
})
.catch(err =>{
  console.log(err);
})