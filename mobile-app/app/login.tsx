import { useState } from "react"
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useUser } from "@/contexts/UserContext"

export default function LoginScreen() {
  const { login, loading } = useUser()
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleLogin() {
    if (!userId.trim()) {
      setError("Please enter a user ID")
      return
    }

    try {
      setError("")
      await login(userId.trim())
      router.replace("/(tabs)/training")
    } catch (err) {
      setError("Failed to login. Please try again.")
      console.error(err)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome to Reflash</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">User ID</Text>
              <Input
                value={userId}
                onChangeText={setUserId}
                placeholder="Enter your user ID"
                editable={!loading}
                onSubmitEditing={handleLogin}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error && <Text className="text-sm text-destructive">{error}</Text>}
            <Button
              onPress={handleLogin}
              disabled={loading || !userId.trim()}
              className="w-full">
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="white" />
                  <Text>Logging in...</Text>
                </View>
              ) : (
                <Text>Login</Text>
              )}
            </Button>
          </CardContent>
        </Card>
      </View>
    </KeyboardAvoidingView>
  )
}
