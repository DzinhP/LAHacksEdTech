"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, BookOpen, GraduationCap, Calendar, CheckCircle, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"

export default function StudentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId as string
  
  // Query student details
  const studentDetails = useQuery(api.students.getStudentDetails, { 
    studentId: studentId as Id<"users"> 
  })
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview")
  
  // Loading state
  if (studentDetails === undefined) {
    return (
      <div className="container flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Error state
  if (!studentDetails) {
    return (
      <div className="container">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
          <h3 className="text-lg font-medium">Student not found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            The student you're looking for doesn't exist or you don't have access to their information.
          </p>
          <Button onClick={() => router.push('/protected/students')}>
            Back to Students
          </Button>
        </div>
      </div>
    )
  }
  
  // Calculate performance metrics
  const totalAssignments = studentDetails.grades.length
  const averageScore = totalAssignments > 0 
    ? studentDetails.grades.reduce((sum, grade) => sum + grade.score, 0) / totalAssignments 
    : 0
  
  const totalAttendance = studentDetails.attendance.length
  const presentDays = studentDetails.attendance.filter(record => record.present).length
  const attendanceRate = totalAttendance > 0 
    ? (presentDays / totalAttendance) * 100 
    : 0
  
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
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push('/protected/students')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight">Student Profile</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-2">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(studentDetails.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{studentDetails.name || "Unnamed Student"}</CardTitle>
            <CardDescription className="text-sm break-words">
              {studentDetails.email || "No email provided"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Performance Summary</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Grade</span>
                      <span className="font-medium">{averageScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={averageScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Attendance</span>
                      <span className="font-medium">{attendanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={attendanceRate} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Enrolled Courses</h4>
                <div className="flex flex-wrap gap-2">
                  {studentDetails.enrolledCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not enrolled in any courses</p>
                  ) : (
                    studentDetails.enrolledCourses.map((course) => (
                      <Badge key={course._id} variant="outline" className="text-xs">
                        {course.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Overview</CardTitle>
                  <CardDescription>Summary of student's academic performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="text-sm font-medium">Courses</h3>
                      <p className="text-2xl font-bold mt-1">{studentDetails.enrolledCourses.length}</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="text-sm font-medium">Assignments</h3>
                      <p className="text-2xl font-bold mt-1">{totalAssignments}</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="text-sm font-medium">Attendance</h3>
                      <p className="text-2xl font-bold mt-1">
                        {presentDays}/{totalAttendance}
                      </p>
                    </div>
                  </div>
                  
                  {studentDetails.enrolledCourses.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Course Performance</h3>
                      <div className="space-y-3">
                        {studentDetails.enrolledCourses.map((course) => {
                          // Calculate course-specific metrics
                          const courseGrades = studentDetails.grades.filter(
                            grade => grade.courseId === course._id
                          )
                          const courseAverage = courseGrades.length > 0
                            ? courseGrades.reduce((sum, grade) => sum + grade.score, 0) / courseGrades.length
                            : 0
                            
                          const courseAttendance = studentDetails.attendance.filter(
                            record => record.courseId === course._id
                          )
                          const courseAttendanceRate = courseAttendance.length > 0
                            ? (courseAttendance.filter(record => record.present).length / courseAttendance.length) * 100
                            : 0
                            
                          return (
                            <div key={course._id} className="border rounded-md p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">{course.name}</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push(`/protected/courses/${course._id}`)}
                                >
                                  View Course
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Average Grade</span>
                                    <span className="font-medium">{courseAverage.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={courseAverage} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Attendance</span>
                                    <span className="font-medium">{courseAttendanceRate.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={courseAttendanceRate} className="h-2" />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Grades Tab */}
            <TabsContent value="grades">
              <Card>
                <CardHeader>
                  <CardTitle>Grades</CardTitle>
                  <CardDescription>
                    {totalAssignments} {totalAssignments === 1 ? 'assignment' : 'assignments'} graded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {totalAssignments === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No grades yet</h3>
                      <p className="text-muted-foreground mt-1">
                        This student hasn't been graded on any assignments yet
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <div className="grid grid-cols-4 p-4 font-medium border-b">
                        <div>Assignment</div>
                        <div>Course</div>
                        <div>Score</div>
                        <div>Status</div>
                      </div>
                      {studentDetails.grades
                        .sort((a, b) => b._creationTime - a._creationTime) // Sort by newest first
                        .map((grade) => {
                          // Find the course for this grade
                          const course = studentDetails.enrolledCourses.find(
                            c => c._id === grade.courseId
                          )
                          
                          // Find the assignment for this grade
                          // Note: We would need to fetch assignment details separately
                          // For now, we'll just show the ID
                          
                          return (
                            <div key={grade._id} className="grid grid-cols-4 p-4 border-b last:border-0 items-center">
                              <div className="font-medium">Assignment {grade.assignmentId.slice(-4)}</div>
                              <div>{course?.name || "Unknown Course"}</div>
                              <div>{grade.score}%</div>
                              <div>
                                {grade.score >= 70 ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Passing
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-red-200 text-red-800">
                                    Needs Improvement
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Attendance Tab */}
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    {presentDays} present out of {totalAttendance} {totalAttendance === 1 ? 'day' : 'days'} ({attendanceRate.toFixed(1)}%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {totalAttendance === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No attendance records yet</h3>
                      <p className="text-muted-foreground mt-1">
                        Attendance records will appear here once they are recorded
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <div className="grid grid-cols-4 p-4 font-medium border-b">
                        <div>Date</div>
                        <div>Course</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                      {studentDetails.attendance
                        .sort((a, b) => b.date - a.date) // Sort by newest first
                        .map((record) => {
                          // Find the course for this attendance record
                          const course = studentDetails.enrolledCourses.find(
                            c => c._id === record.courseId
                          )
                          
                          return (
                            <div key={record._id} className="grid grid-cols-4 p-4 border-b last:border-0 items-center">
                              <div className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</div>
                              <div>{course?.name || "Unknown Course"}</div>
                              <div>
                                {record.present ? (
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span>Present</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-red-600">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    <span>Absent</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Button variant="outline" size="sm">
                                  Update
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}