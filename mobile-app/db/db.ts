import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as coursesSchema from "./schema/course";
import * as flashcardsSchema from "./schema/flashcard";
import * as unitsSchema from "./schema/unit";

const expo = openDatabaseSync("reflash.db", { enableChangeListener: true });
export const db = drizzle(expo, {
  schema: {
    ...coursesSchema,
    ...unitsSchema,
    ...flashcardsSchema,
  },
});
