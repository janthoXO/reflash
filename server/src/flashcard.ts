import { Schema } from "mongoose";

interface Flashcard {
    question: string;
    answer: string;
    fileId: Schema.Types.ObjectId;
}

export default Flashcard;