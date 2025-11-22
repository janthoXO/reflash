import { Schema, model} from 'mongoose';
import Flashcard from '../flashcard';

const flashcardsSchema = new Schema<Flashcard>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
});

const DBflashcard = model<Flashcard>('DBflashcard', flashcardsSchema);

export default DBflashcard;