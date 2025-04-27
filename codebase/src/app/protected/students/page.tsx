"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, GraduationCap, Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"

export default function StudentsPage() {
  const router = useRouter()
  
  // Use a query to list all students instead of getting details for a specific student
  const students = useQuery(api.students.listStudents)
  
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter students based on search query
  const filteredStudents = students?.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  // Get initials from name
  const getInitials = (name: string | undefined) => {
    if (!name) return "S"
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Loading state
  if (students === undefined) {
    return (
      <div className="container flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight">Students</h2>
        <Button onClick={() => router.push('/protected/students/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No students yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Add your first student to get started
          </p>
          <Button onClick={() => router.push('/protected/students/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-medium">No matching students</h3>
          <p className="text-muted-foreground mt-1">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student._id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/protected/students/${student._id}`)}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{student.name || "Unnamed Student"}</CardTitle>
                  <CardDescription className="text-sm truncate max-w-[200px]">
                    {student.email || "No email provided"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {student.enrolledCourses?.length || 0} courses enrolled
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.enrolledCourses?.slice(0, 3).map((course) => (
                    <Badge key={course._id} variant="outline" className="text-xs">
                      {course.name}
                    </Badge>
                  ))}
                  {(student.enrolledCourses?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(student.enrolledCourses?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" size="sm">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}