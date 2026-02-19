const mongoose = require("mongoose");

const DesignSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    canvasData: String,
    width: Number,
    height: Number,
    category: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Design = mongoose.models.Design || mongoose.model('Design',DesignSchema);
module.exports = Design;