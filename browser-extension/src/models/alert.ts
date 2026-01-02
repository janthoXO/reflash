export interface Alert {
  level: "info" | "warning" | "error" | "success";
  message: string;
  timestamp?: number;
}
