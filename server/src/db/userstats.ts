import { Schema, model} from 'mongoose';

const userStatsSchema = new Schema({
    userId : { type: String, required: true, unique: true },
    streak: { type: Number, required: true, default: 0 },
    lastStudied: { type: Number, required: true, default: 0 },
    courses: { type: [Schema.Types.ObjectId], ref: 'Course', default: [] },
});

const UserStats = model('UserStats', userStatsSchema);

export default UserStats;