"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, User, BookOpen, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function StudentsPage() {
  const router = useRouter()
  const students = useQuery(api.students.listStudents)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter students based on search query
  const filteredStudents = students?.filter(student => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (student.name?.toLowerCase().includes(searchLower) || false) ||
      (student.email?.toLowerCase().includes(searchLower) || false)
    )
  })
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  }

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

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight">Students</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {students === undefined ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No students yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Students will appear here when they are enrolled in your courses
          </p>
        </div>
      ) : filteredStudents?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No matching students</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            No students match your search criteria
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredStudents?.map((student) => (
            <motion.div key={student._id} variants={itemVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-12 w-12 border">
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
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Enrolled Courses
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {student.enrolledCourses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Not enrolled in any courses</p>
                        ) : (
                          student.enrolledCourses.map((course) => (
                            <Badge key={course._id} variant="outline" className="text-xs">
                              {course.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Performance Summary</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted rounded-md p-2">
                          <p className="text-xs text-muted-foreground">Assignments</p>
                          <p className="text-lg font-medium">{student.grades.length}</p>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                          <p className="text-xs text-muted-foreground">Attendance</p>
                          <p className="text-lg font-medium">
                            {student.attendance.filter(a => a.present).length}/{student.attendance.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/protected/students/${student._id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}