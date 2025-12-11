'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast({
          title: "Logout Successful",
          description: "You have been logged out successfully.",
        })
        
        // Redirect to login page
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        toast({
          title: "Logout Failed",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Validate passwords
      if (newPassword !== confirmPassword) {
        toast({
          title: "Password Error",
          description: "New passwords do not match.",
          variant: "destructive",
        })
        return
      }
      
      if (newPassword.length < 6) {
        toast({
          title: "Password Error",
          description: "New password must be at least 6 characters long.",
          variant: "destructive",
        })
        return
      }
      
      // In a real app, you would get the user ID from the session/token
      // For now, we'll use a placeholder ID (1 for admin user)
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Placeholder - in real app, get from session
          currentPassword,
          newPassword
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully.",
        })
        
        // Clear password fields
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast({
          title: "Password Update Failed",
          description: data.error || "Failed to update password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Password Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>
        <Button onClick={handleLogout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@ssengineering.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" defaultValue="SS Engineering" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password regularly to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePasswordUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="mt-4">
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}