import "./style.css"
import { Button } from "~components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~components/ui/card"
import { useState } from "react"
import { useUser } from "~hooks/useUser"
import { Loader2 } from "lucide-react"

function Login() {
  const { login, loading } = useUser()
  const [userId, setUserId] = useState("")

  function handleLogin() {
    if (userId.trim()) {
      login(userId.trim())
    }
  }

  return (
    <div className="w-96 min-h-[400px] bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Reflash</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium text-foreground">
              User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your user ID"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={loading || !userId.trim()}
            className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login