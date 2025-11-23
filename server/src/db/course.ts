import { Schema, model} from 'mongoose';

const courseSchema = new Schema({
    url: { type: String, required: true, unique: true },
    name: { type: String, required: true },
});

const Course = model('Course', courseSchema);

export default Course;