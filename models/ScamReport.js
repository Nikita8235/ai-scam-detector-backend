const mongoose = require("mongoose");

const scamReportSchema = new mongoose.Schema(
{
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    message:{
        type:String,
        required:true
    },

    risk:{
        type:String,
        required:true
    },

    detectedKeywords:{
        type:[String],
        default:[]
    },

    isScam:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("ScamReport", scamReportSchema);