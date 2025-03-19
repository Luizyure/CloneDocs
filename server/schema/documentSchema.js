import mongoose from "mongoose";

const documentSchema = mongoose.Schema({
    _id: {
        type: String,
        require: true,
    },
    data: {
        type: Object,
        require: true,
    },
})

const document = mongoose.model("document", documentSchema);

export default document;

