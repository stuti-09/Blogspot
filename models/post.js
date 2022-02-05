const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required: true
    },
    content:{
        type:String,
        required:true
    },
    creator:{
        
        type: Schema.Types.ObjectId,
        ref :'User',
        required: true
    },
    username:{
        type:String,
        ref:'User',
        required:true
    }

},
{timestamps: true});
postSchema.index({title: 'text', content:'text'});
module.exports = mongoose.model('Post',postSchema);
