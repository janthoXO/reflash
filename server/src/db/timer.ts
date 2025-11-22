import { Schema, model} from 'mongoose';

const timerSchema = new Schema({
    userId : { type: String, required: true, unique: true },
    flashcardId: { type: Schema.Types.ObjectId, ref: 'DBflashcard', required: true },
    time: { type: Number, required: true },
});

const Timer = model('Timer', timerSchema);

export default Timer;