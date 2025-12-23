import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useSelectedUnits } from "@/context/SelectedUnitsContext";
import { db } from "@/db/db";
import { isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { Square, SquareCheck } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function LibraryScreen() {
  const { data: courses } = useLiveQuery(
    db.query.coursesTable.findMany({
      where: (coursesTable) => isNull(coursesTable.deletedAt),
      with: {
        units: true,
      },
    })
  );
  const { isCourseSelected, isUnitSelected, toggleCourse, toggleUnit } = useSelectedUnits();
  const router = useRouter();

  return (
    <ScrollView className="p-4">
      {courses.length === 0 ? (
        <Text className="text-center text-muted-foreground">No courses found.</Text>
      ) : (
        <Accordion type="multiple" className="gap-2">
          {courses.map((course) => {
            const isSelected = isCourseSelected(course.id);

            return (
              <AccordionItem
                key={course.id}
                value={course.id.toString()}
                className="rounded-lg border border-border bg-card px-2">
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => toggleCourse(course)} className="mr-2">
                    {isSelected ? (
                      <Icon as={SquareCheck} className="text-primary" />
                    ) : (
                      <Icon as={Square} className="text-muted-foreground" />
                    )}
                  </TouchableOpacity>
                  <View className="flex-1">
                    <AccordionTrigger>
                      <Text className="font-semibold text-card-foreground">{course.name}</Text>
                    </AccordionTrigger>
                  </View>
                </View>

                <AccordionContent>
                  <Separator />
                  <View>
                    {course.units.length === 0 ? (
                      <Text className="text-sm text-muted-foreground">No units</Text>
                    ) : (
                      course.units.map((unit) => {
                        const isUnitSel = isUnitSelected(course.id, unit.id);
                        return (
                          <View key={unit.id} className="flex-row items-center gap-2 p-2">
                            <TouchableOpacity onPress={() => toggleUnit(unit)}>
                              {isUnitSel ? (
                                <Icon as={SquareCheck} className="text-primary" />
                              ) : (
                                <Icon as={Square} className="text-muted-foreground" />
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              className="flex-1"
                              onPress={() => router.push(`/courses/${course.id}/units/${unit.id}`)}>
                              <Text className="text-primary">{unit.fileName}</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </ScrollView>
  );
}
