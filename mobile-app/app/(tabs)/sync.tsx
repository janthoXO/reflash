import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { UrFountainDecoder } from "@ngraveio/bc-ur";
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

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      const decoder = decoderRef.current;
      // If already complete, ignore
      if (scanStatus === "completed") return;

      for (const code of codes) {
        if (!code.value) continue;

        try {
          decoder.receivePartUr(code.value);
          const p = decoder.getProgress();
          setProgress(p);

          if (decoder.isComplete()) {
            setScanStatus("completed");
            if (decoder.isSuccessful()) {
              const decoded = decoder.getDecodedData();
              console.log("Decoded data:", decoded);
            } else {
              console.log("Error found while decoding", decoder.getError());
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
            Progress: {(progress * 100).toFixed(0)}%
          </Text>
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
