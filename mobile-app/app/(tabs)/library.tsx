import { Text } from "@/components/ui/text";
import { coursesTable } from "@/db/schema/course";
import { db } from "@/db/db";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { unitsTable } from "@/db/schema/unit";
import { flashcardsTable } from "@/db/schema/flashcard";

export default function LibraryScreen() {
  const { data: courses } = useLiveQuery(db.select().from(coursesTable));

  useEffect(() => {
    console.log("Courses:", courses);
  }, [courses]);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <Text>Library Screen</Text>

      {courses.length === 0 ? (
        <Text>No courses available.</Text>
      ) : (
        <ScrollView>
          {courses?.map((course) => (
            <Text key={course.id}>{course.name}</Text>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
