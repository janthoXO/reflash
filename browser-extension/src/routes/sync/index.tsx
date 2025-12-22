import type { Course } from "@reflash/shared";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelected } from "~contexts/SelectedContext";
import { db } from "~db/db";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "~components/ui/button";
import { UR, UrFountainEncoder } from "@ngraveio/bc-ur";
import { Ban, Play } from "lucide-react";

export default function SyncPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const { selectedMap } = useSelected();

  const [populatedCourses, setPopulatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [qrCodeValue, setQrCodeValue] = useState("");
  const [cancelQRGif, setCancelQRGif] = useState<(() => void) | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        let courses: Course[] = [];

        if (mode === "all") {
          // fetch everything also deleted entries
          const dbCourses = await db.courses.toArray();
          courses = await Promise.all(
            dbCourses.map(async (course) => {
              const units = await db.units
                .where({ courseId: course.id })
                .toArray();

              const populatedUnits = await Promise.all(
                units.map(async (unit) => {
                  const cards = await db.flashcards
                    .where({ unitId: unit.id })
                    .toArray();
                  return { ...unit, cards };
                })
              );
              return { ...course, units: populatedUnits };
            })
          );
        } else if (mode === "selected") {
          const selectedCourseIds = Object.keys(selectedMap).map(Number);
          const dbCourses = await db.courses
            .where("id")
            .anyOf(selectedCourseIds)
            .filter((course) => course.deletedAt === null)
            .toArray();

          courses = await Promise.all(
            dbCourses.map(async (course) => {
              const selectedUnitIds = selectedMap[course.id] || [];
              const units = await db.units
                .where("id")
                .anyOf(selectedUnitIds)
                .filter((unit) => unit.deletedAt === null)
                .toArray();

              const populatedUnits = await Promise.all(
                units.map(async (unit) => {
                  const cards = await db.flashcards
                    .where({ unitId: unit.id })
                    .filter((card) => card.deletedAt === null)
                    .toArray();
                  return { ...unit, cards };
                })
              );
              return { ...course, units: populatedUnits };
            })
          );
        } else {
          toast.error("No correct sync mode specified.");
        }

        setPopulatedCourses(courses);
      } catch (error) {
        console.error("Error populating courses:", error);
        toast.error("Failed to load courses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [mode, selectedMap]);

  useEffect(() => {
    console.debug("Populated Courses for Sync:", populatedCourses);
  }, [populatedCourses]);

  async function startSync() {
    console.debug("Starting sync ", cancelQRGif);
    if (cancelQRGif) return; // Already syncing

    try {
      const payload = UR.fromData({
        type: "courses",
        payload: populatedCourses,
      });
      console.debug("Payload UR: ", payload);
      const encoder = new UrFountainEncoder(payload);
      console.debug("Fountain encoder initialized: ", encoder);

      const interval = setInterval(() => {
        if (encoder.isComplete()) {
          console.debug("Fountain encoding complete");
          clearInterval(interval);
          setCancelQRGif(undefined);
          return;
        }

        const nextPart = encoder.nextPart();
        console.debug("Next QR Code Part: ", nextPart);
        // Get the next fountain code part
        setQrCodeValue(nextPart.toString());
      }, 100); // 100ms = 10 FPS (Adjust based on phone camera capability)

      console.debug("QR code interval started");
      setCancelQRGif(() => () => clearInterval(interval));
    } catch (error) {
      console.error("Error starting sync:", error);
      toast.error("Failed to start sync.");
    }
  }

  if (isLoading) {
    return <div className="text-base text-center">Loading...</div>;
  }

  if (populatedCourses.length === 0) {
    return <div className="text-base text-center">No courses to sync.</div>;
  }

  return (
    <div className="flex-1 flex flex-col justify-evenly items-center gap-4">
      <p className="text-base text-center">
        Hold the in app scanner over the QR code and press start. This will
        flash a sequence of QR codes.
      </p>
      <QRCodeSVG
        value={qrCodeValue}
        size={256}
        level={"L"} // Low error correction is fine because Fountain codes handle the redundancy
      />
      {cancelQRGif ? (
        <Button
          variant="secondary"
          onClick={() => {
            cancelQRGif();
            setCancelQRGif(undefined);
          }}
        >
          <Ban />
          Stop Sync
        </Button>
      ) : (
        <Button onClick={() => startSync()}>
          <Play />
          Start Sync
        </Button>
      )}
    </div>
  );
}
