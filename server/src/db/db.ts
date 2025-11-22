import { connect, Schema } from 'mongoose';
import File from './file';
import Course from './course';
import DBflashcard from './flashcards';
import Timer from './timer';

async function run() {
  await connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reflash');

  // Initialize database with sample data only if it doesn't exist
  try {

    const timer = await Timer.findOne({});
    
    if (!timer) {
      const card = await DBflashcard.findOne({});
      const id = card ? card._id : null;
      console.log("Found flashcard id: ", id);
      const sampleTimer = new Timer({
        userId: 'sampleUser',
        flashcardId: id, // Sample ObjectId
        time: new Date().getTime(),
      });
      await sampleTimer.save();
      console.log('Sample timer created');
    } else {
      console.log('Timer already exists, skipping sample timer creation');
    }

    const existingCourse = await Course.findOne({ url: 'http://example.com/course1' });
    
    if (!existingCourse) {
      const session = await File.db.startSession();
      await session.withTransaction(async () => {
        const course = new Course({
          url: 'http://example.com/course1'
        });

        await course.save({ session });

        const courseId = course._id;

        const file = new File({
          filename: 'test2',
          courseId: courseId,
        });

        await file.save({ session });
      });
      session.endSession();
      console.log('Database initialized with sample data');
    } else {
      console.log('Database already initialized, skipping sample data creation');
    }
  } catch (error) {
    console.log('Database initialization completed (some entries may already exist)');
  }
}

export { run };