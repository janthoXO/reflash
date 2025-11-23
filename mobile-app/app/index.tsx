import { Redirect } from "expo-router"
import { useUser } from "@/contexts/UserContext"
import { View, ActivityIndicator } from "react-native"

export default function Index() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (user) {
    return <Redirect href="/(tabs)/training" />
  }

  return <Redirect href="/login" />
}
