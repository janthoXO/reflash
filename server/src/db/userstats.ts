import { Schema, model} from 'mongoose';

const userStatsSchema = new Schema({
    userId : { type: String, required: true, unique: true },
    flashcardId: { type: Schema.Types.ObjectId, ref: 'DBflashcard', required: true },
    time: { type: Number, required: true },
});

const UserStats = model('UserStats', userStatsSchema);

export default UserStats;