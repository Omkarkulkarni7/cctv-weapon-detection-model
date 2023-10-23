const mongoose = require("mongoose");

const connectDB = async ()=>{
    try
    {
        await mongoose.connect('mongodb+srv://Omkar:Gayatri2012@cluster0.md8axgx.mongodb.net/S3?retryWrites=true&w=majority',{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    }
    catch(err)
    {
        console.log(err);
    }
}

module.exports = connectDB