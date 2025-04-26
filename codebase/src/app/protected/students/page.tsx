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
              <TabsTrigger value="iep">IEP Form</TabsTrigger>
              <TabsTrigger value="mtss">MTSS</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
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
            
            {/* MTSS Tab */}
            <TabsContent value="mtss">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Tiered System of Supports (MTSS)</CardTitle>
                  <CardDescription>
                    Track interventions and support strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Reason for Concern */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Reason for Concern</h3>
                      <p className="text-sm text-muted-foreground">
                        Teacher reported significant and persistent difficulties with phonological awareness and letter-sound correspondence impacting early literacy skills.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Initial Concern: 2024-09-10</Badge>
                        <Badge variant="outline">RTI Tier: 3</Badge>
                      </div>
                    </div>
                    
                    {/* Rest of MTSS content... */}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Update MTSS Data</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Evaluation Tab */}
            <TabsContent value="evaluation">
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Evaluation</CardTitle>
                  <CardDescription>
                    Evaluation data for special education eligibility determination
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Evaluation Team */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Evaluation Team</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: "Dr. Anya Petrova", role: "School Psychologist" },
                          { name: "Sarah Chen", role: "Speech-Language Pathologist" },
                          { name: "Maria Garcia", role: "Occupational Therapist (Consult)" }
                        ].map((member, index) => (
                          <div key={index} className="flex items-center p-3 border rounded-md">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Psychological Evaluation */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Psychological Evaluation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Evaluation Date: May 15, 2025
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Administered Tests</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>
                              <span className="font-medium">Wechsler Intelligence Scale for Children - Fifth Edition (WISC-V)</span>
                              <p className="text-muted-foreground">Subtests: Full Scale IQ, Verbal Comprehension Index, Visual Spatial Index, Fluid Reasoning Index, Working Memory Index, Processing Speed Index</p>
                            </li>
                            <li>
                              <span className="font-medium">Woodcock-Johnson IV Tests of Achievement</span>
                              <p className="text-muted-foreground">Clusters: Basic Reading Skills, Reading Comprehension, Math Calculation Skills, Math Problem Solving, Written Expression, Oral Language</p>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Cognitive Assessment Results</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Full Scale IQ</p>
                              <p className="text-2xl font-bold">82</p>
                              <Badge className="mt-1">Low Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Verbal Comprehension</p>
                              <p className="text-2xl font-bold">85</p>
                              <Badge className="mt-1">Low Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Visual Spatial</p>
                              <p className="text-2xl font-bold">90</p>
                              <Badge className="mt-1">Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Fluid Reasoning</p>
                              <p className="text-2xl font-bold">79</p>
                              <Badge className="mt-1">Low</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Working Memory</p>
                              <p className="text-2xl font-bold">88</p>
                              <Badge className="mt-1">Low Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Processing Speed</p>
                              <p className="text-2xl font-bold">83</p>
                              <Badge className="mt-1">Low Average</Badge>
                            </div>
                          </div>
                          <p className="text-sm mt-3">
                            Caleb's Full Scale IQ falls within the low average range. His relative weaknesses were noted in Fluid Reasoning and Processing Speed. Strengths were observed in his Visual Spatial abilities. His Verbal Comprehension and Working Memory skills were in the average range.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Achievement Assessment Results</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Basic Reading Skills</p>
                              <p className="text-2xl font-bold">75</p>
                              <Badge variant="outline" className="mt-1 border-red-200 text-red-800">Below Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Reading Comprehension</p>
                              <p className="text-2xl font-bold">78</p>
                              <Badge variant="outline" className="mt-1 border-red-200 text-red-800">Below Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Math Calculation</p>
                              <p className="text-2xl font-bold">88</p>
                              <Badge className="mt-1">Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Math Problem Solving</p>
                              <p className="text-2xl font-bold">85</p>
                              <Badge className="mt-1">Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Written Expression</p>
                              <p className="text-2xl font-bold">80</p>
                              <Badge className="mt-1">Low Average</Badge>
                            </div>
                            <div className="p-3 border rounded-md text-center">
                              <p className="text-sm text-muted-foreground">Oral Language</p>
                              <p className="text-2xl font-bold">92</p>
                              <Badge className="mt-1">Average</Badge>
                            </div>
                          </div>
                          <p className="text-sm mt-3">
                            Caleb demonstrated significant weaknesses in Basic Reading Skills and Reading Comprehension, falling in the low range. His Math Calculation and Problem Solving skills were in the average range, as was Written Expression. Oral Language skills were a relative strength, within the average range.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Behavioral Observations</h4>
                          <p className="text-sm">
                            Caleb was cooperative during testing but exhibited some frustration during tasks requiring phonological manipulation and rapid naming. He required occasional redirection to maintain focus on timed tasks.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Speech-Language Evaluation */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Speech-Language Evaluation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Evaluation Date: May 10, 2025
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Areas Assessed</h4>
                          <div className="flex flex-wrap gap-2">
                            {["Phonological Awareness", "Phonics Skills", "Oral Language Comprehension", "Expressive Language", "Articulation"].map((area, index) => (
                              <Badge key={index} variant="outline">{area}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Findings Summary</h4>
                          <div className="space-y-3">
                            <div className="p-3 border rounded-md">
                              <p className="font-medium">Phonological Awareness</p>
                              <p className="text-sm text-muted-foreground">
                                Demonstrates significant deficits in phoneme segmentation, blending, and manipulation skills, scoring significantly below age expectations.
                              </p>
                            </div>
                            <div className="p-3 border rounded-md">
                              <p className="font-medium">Phonics Skills</p>
                              <p className="text-sm text-muted-foreground">
                                Struggles with letter-sound correspondence and decoding single and multi-syllabic words. Relies heavily on guessing.
                              </p>
                            </div>
                            <div className="p-3 border rounded-md">
                              <p className="font-medium">Oral Language Comprehension</p>
                              <p className="text-sm text-muted-foreground">
                                Age-appropriate receptive vocabulary and understanding of basic sentence structures.
                              </p>
                            </div>
                            <div className="p-3 border rounded-md">
                              <p className="font-medium">Expressive Language</p>
                              <p className="text-sm text-muted-foreground">
                                Generally age-appropriate expressive vocabulary and sentence formation, but some difficulty with complex sentence structures when describing events.
                              </p>
                            </div>
                            <div className="p-3 border rounded-md">
                              <p className="font-medium">Articulation</p>
                              <p className="text-sm text-muted-foreground">
                                All phonemes were produced within normal limits.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <p className="text-sm p-3 border rounded-md">
                            Continued speech-language support focusing on explicit and systematic instruction in phonological awareness and phonics skills is recommended to improve Caleb's foundational reading abilities.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Occupational Therapy Consult */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Occupational Therapy Consult</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Consultation Date: May 8, 2025
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Areas Observed</h4>
                          <div className="flex flex-wrap gap-2">
                            {["Fine Motor Skills", "Gross Motor Skills", "Sensory Processing"].map((area, index) => (
                              <Badge key={index} variant="outline">{area}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Findings Summary</h4>
                          <p className="text-sm p-3 border rounded-md">
                            No significant concerns noted in fine or gross motor skills. Teacher report indicates occasional difficulties with organization of written work, but direct observation did not reveal significant fine motor deficits. No significant sensory processing concerns reported or observed.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <p className="text-sm p-3 border rounded-md">
                            No direct occupational therapy services recommended at this time. Strategies for visual organization of written work may be beneficial.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Evaluation Summary and Eligibility */}
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Evaluation Summary</h3>
                      <p className="text-sm mb-4">
                        Based on the comprehensive evaluations, Caleb presents with significant deficits in basic reading skills and phonological awareness, impacting his reading fluency and comprehension. Cognitive testing reveals a relative weakness in fluid reasoning and processing speed. These findings are consistent with a Specific Learning Disability in Reading (Dyslexia).
                      </p>
                      
                      <h3 className="text-lg font-medium mb-2">Recommendation for Eligibility</h3>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm font-medium text-amber-800">
                          Based on the evaluation data, Caleb meets the criteria for a Specific Learning Disability under federal and state guidelines. An IEP is recommended to provide specialized instruction and related services to address his identified needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Generate IEP Draft</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* IEP Tab */}
            <TabsContent value="iep">
              <Card>
                <CardHeader>
                  <CardTitle>Individualized Education Program (IEP)</CardTitle>
                  <CardDescription>
                    Special education services and accommodations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">IEP in Development</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      The IEP is currently being developed based on evaluation results. Please check back soon or click the button below to start creating an IEP.
                    </p>
                    <Button className="mt-4">Create IEP</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}