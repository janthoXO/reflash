import { Schema, model} from 'mongoose';

const fileSchema = new Schema({
    filename : { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
});

const File = model('File', fileSchema);

export default File;