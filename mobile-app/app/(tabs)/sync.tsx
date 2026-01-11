import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { db } from "@/db/db";
import { coursesTable } from "@/db/schema/course";
import { flashcardsTable } from "@/db/schema/flashcard";
import { unitsTable } from "@/db/schema/unit";
import { UrFountainDecoder } from "@ngraveio/bc-ur";
import { Course } from "@/models/course";
import { sql } from "drizzle-orm";
import { CheckCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";

export default function SyncScreen() {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  // Use useRef to keep the decoder instance stable across renders
  const decoderRef = useRef(new UrFountainDecoder());
  const [scanStatus, setScanStatus] = useState<"none" | "scanning" | "completed">("none");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  async function updateCourses(courses: Course[]) {
    try {
      await Promise.all(
        courses.map(async (course) => {
          const { units, ...courseData } = course;
          await db
            .insert(coursesTable)
            .values(courseData)
            .onConflictDoUpdate({
              target: coursesTable.id,
              set: courseData,
              setWhere: sql`${coursesTable.updatedAt} < ${courseData.updatedAt}`,
            });

          await Promise.all(
            units?.map(async (unit) => {
              const { cards, ...unitData } = unit;
              await db
                .insert(unitsTable)
                .values(unitData)
                .onConflictDoUpdate({
                  target: unitsTable.id,
                  set: unitData,
                  setWhere: sql`${unitsTable.updatedAt} < ${unitData.updatedAt}`,
                });

              await Promise.all(
                cards?.map(async (card) => {
                  await db
                    .insert(flashcardsTable)
                    .values(card)
                    .onConflictDoUpdate({
                      target: flashcardsTable.id,
                      set: card,
                      setWhere: sql`${flashcardsTable.updatedAt} < ${card.updatedAt}`,
                    });
                }) ?? []
              );
            }) ?? []
          );
        })
      );
    } catch (error) {
      console.error("Error updating courses:", error);
    }
  }

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      const decoder = decoderRef.current;
      // If already complete, ignore
      if (decoder.isComplete() || scanStatus === "completed") return;

      for (const code of codes) {
        if (!code.value) continue;

        try {
          decoder.receivePartUr(code.value);
          const p = decoder.getProgress();
          setProgress(p * 100);

          if (decoder.isComplete()) {
            setScanStatus("completed");
            if (decoder.isSuccessful()) {
              const courses = decoder.getDecodedData() as Course[];
              console.debug("Decoded courses:", JSON.stringify(courses));
              updateCourses(courses);
              break;
            } else {
              console.error("Error found while decoding", decoder.getError());
            }
          }
        } catch (e) {
          console.warn("Invalid frame", e, "\nValue that caused error:", code.value);
        }
      }
    },
  });

  function startScan() {
    resetScan();
    setScanStatus("scanning");
  }

  function resetScan() {
    // Reset by creating a new decoder
    decoderRef.current = new UrFountainDecoder();
    setScanStatus("none");
    setProgress(0);
  }

  if (device == null) {
    return (
      <View className="items-center justify-center p-4">
        <Text className="text-base font-medium">No camera found</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="items-center justify-center gap-4 p-4">
        <Text className="text-base font-medium">
          Camera permission is required to scan QR codes.
        </Text>
        <Button onPress={() => requestPermission()}>
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <Text className="text-base">Scan the QR code in the browser extension</Text>
      {scanStatus === "scanning" ? (
        <View className="w-full flex-1 gap-4">
          <Text className="text-center text-sm text-muted-foreground">
            Progress: {progress.toFixed(0)}%
          </Text>
          <Progress value={progress} className="mb-4" />
          <Card className="w-full flex-1">
            <CardContent>
              <Camera
                style={{ width: "100%", height: "100%" }}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
              />
            </CardContent>
          </Card>
          <Button onPress={() => resetScan()}>
            <Text>Reset Scanning</Text>
          </Button>
        </View>
      ) : (
        <View className="gap-4">
          {scanStatus === "completed" && (
            <Alert icon={CheckCircle}>
              <AlertTitle>Sync Completed</AlertTitle>
            </Alert>
          )}

          <Button onPress={() => startScan()}>
            <Text>Start scan</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
