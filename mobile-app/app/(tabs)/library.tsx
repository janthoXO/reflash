import DeleteDialog from "@/components/deleteDialog";
import EditContextmenu from "@/components/editContextmenu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useSelectedUnits } from "@/context/SelectedUnitsContext";
import { deleteCourse } from "@/db/course-queries";
import { db } from "@/db/db";
import { coursesTable } from "@/db/schema/course";
import { unitsTable } from "@/db/schema/unit";
import { deleteUnit } from "@/db/unit-queries";
import { Course, Unit } from "@reflash/shared";
import { eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { Check, Square, SquareCheck, X } from "lucide-react-native";
import { useState } from "react";
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

  return (
    <ScrollView className="p-4">
      {courses.length === 0 ? (
        <Text className="text-center text-muted-foreground">No courses found.</Text>
      ) : (
        <Accordion type="multiple" className="gap-2">
          {courses.map((course) => (
            <CourseItem key={`course-${course.id}`} course={course as Course} />
          ))}
        </Accordion>
      )}
    </ScrollView>
  );
}

function CourseItem({ course }: { course: Course }) {
  const { isCourseSelected, toggleCourse } = useSelectedUnits();

  const [isEdit, setIsEdit] = useState(false);
  const [editName, setEditName] = useState(course.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function onSave() {
    await db
      .update(coursesTable)
      .set({ name: editName, updatedAt: Date.now() })
      .where(eq(coursesTable.id, course.id));
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditName(course.name);
  }

  async function onDelete() {
    await deleteCourse(course.id);
    setShowDeleteDialog(false);
  }

  return (
    <AccordionItem
      key={course.id}
      value={course.id.toString()}
      className="rounded-lg border border-border bg-card px-2">
      {isEdit ? (
        <View className="flex-row items-center gap-2 py-2">
          <Input className="flex-1" value={editName} onChangeText={setEditName} />
          <Button variant="ghost" size="icon" onPress={onReset}>
            <Icon as={X} className="text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onPress={onSave}>
            <Icon as={Check} className="text-success" />
          </Button>
        </View>
      ) : (
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => toggleCourse(course)} className="mr-2">
            {isCourseSelected(course.id) ? (
              <Icon as={SquareCheck} className="text-primary" />
            ) : (
              <Icon as={Square} className="text-muted-foreground" />
            )}
          </TouchableOpacity>
          <View className="flex-1">
            <EditContextmenu
              onEdit={() => setIsEdit(true)}
              onDelete={() => setShowDeleteDialog(true)}>
              <AccordionTrigger>
                <Text className="font-semibold text-card-foreground">{course.name}</Text>
              </AccordionTrigger>
            </EditContextmenu>
          </View>
        </View>
      )}

      <AccordionContent>
        <Separator />
        {!course.units || course.units.length === 0 ? (
          <Text className="text-sm text-muted-foreground">No units</Text>
        ) : (
          course.units.map((unit) => {
            return <UnitItem key={`unit-${unit.id}`} unit={unit} />;
          })
        )}
      </AccordionContent>

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting ${course.name}`}
        description={`Are you sure you want to delete the course ${course.name} with all its units and flashcards?`}
        onDelete={onDelete}
      />
    </AccordionItem>
  );
}

function UnitItem({ unit }: { unit: Unit }) {
  const { isUnitSelected, toggleUnit } = useSelectedUnits();
  const router = useRouter();

  const [isEdit, setIsEdit] = useState(false);
  const [editName, setEditName] = useState(unit.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function onSave() {
    await db
      .update(unitsTable)
      .set({ name: editName, updatedAt: Date.now() })
      .where(eq(unitsTable.id, unit.id));
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditName(unit.name);
  }

  async function onDelete() {
    await deleteUnit(unit.id);
    setShowDeleteDialog(false);
  }

  return (
    <View key={unit.id}>
      {isEdit ? (
        <View className="flex-row items-center gap-2 p-2">
          <Input className="flex-1" value={editName} onChangeText={setEditName} />
          <Button variant="ghost" size="icon" onPress={onReset}>
            <Icon as={X} className="text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onPress={onSave}>
            <Icon as={Check} className="text-success" />
          </Button>
        </View>
      ) : (
        <View className="flex-row items-center gap-2 p-2">
          <TouchableOpacity onPress={() => toggleUnit(unit)}>
            {isUnitSelected(unit.courseId, unit.id) ? (
              <Icon as={SquareCheck} className="text-primary" />
            ) : (
              <Icon as={Square} className="text-muted-foreground" />
            )}
          </TouchableOpacity>
          <EditContextmenu
            onEdit={() => setIsEdit(true)}
            onDelete={() => setShowDeleteDialog(true)}
            className="flex-1">
            <TouchableOpacity
              onPress={() => router.push(`/courses/${unit.courseId}/units/${unit.id}`)}>
              <Text className="text-primary">{unit.name}</Text>
            </TouchableOpacity>
          </EditContextmenu>
        </View>
      )}

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting ${unit.name}`}
        description={`Are you sure you want to delete the unit ${unit.name} with all its flashcards?`}
        onDelete={onDelete}
      />
    </View>
  );
}
