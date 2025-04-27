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
import { Loader2, ArrowLeft, BookOpen, GraduationCap, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"
import { useAi } from "@/hooks/use-ai"

export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}
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
  
  // MTSS data (hardcoded as a constant outside of the component rendering)
  const mtssData = {
    studentIdentification: { 
      studentId: "kh7dpavgdytfxsxme4pepwrdhn7estxj", 
      firstName: "Ian", 
      lastName: "Du", 
      grade: 2 
    }, 
    mtssHistory: { 
      reasonForConcern: "Teacher reported significant and persistent difficulties with phonological awareness and letter-sound correspondence impacting early literacy skills.", 
      dateOfInitialConcern: "2024-09-10", 
      rtiTier: "3", 
      interventionsImplemented: [ 
        { 
          interventionName: "Intensive Phonological Awareness Training (Heggerty)", 
          startDate: "2024-09-25", 
          endDate: "2025-01-31", 
          frequency: "5x/week, 30 minutes daily, small group (1:3)", 
          progressMonitoringTool: "DIBELS 8th Edition - PSF, NWF", 
          progressMonitoringFrequency: "weekly" 
        }, 
        { 
          interventionName: "Systematic and Explicit Phonics Instruction (Orton-Gillingham Approach)", 
          startDate: "2024-10-15", 
          endDate: "2025-01-31", 
          frequency: "5x/week, 30 minutes daily, individual", 
          progressMonitoringTool: "Teacher-created phonics assessments", 
          progressMonitoringFrequency: "bi-weekly" 
        } 
      ], 
      progressMonitoringData: [ 
        { date: "2024-09-28", probe: "DIBELS 8 - PSF", result: 15 }, 
        { date: "2024-10-05", probe: "DIBELS 8 - PSF", result: 18 }, 
        { date: "2024-10-12", probe: "DIBELS 8 - PSF", result: 20 }, 
        { date: "2024-10-19", probe: "DIBELS 8 - NWF-CLS", result: 8 }, 
        { date: "2024-10-26", probe: "DIBELS 8 - NWF-CLS", result: 10 }, 
        { date: "2024-11-02", probe: "DIBELS 8 - PSF", result: 22 }, 
        { date: "2024-11-09", probe: "DIBELS 8 - NWF-CLS", result: 12 }, 
        { date: "2024-11-16", probe: "DIBELS 8 - PSF", result: 25 }, 
        { date: "2024-11-23", probe: "DIBELS 8 - NWF-CLS", result: 14 }, 
        { date: "2024-12-07", probe: "Teacher Phonics Assessment", result: "60% accuracy (initial sounds)" }, 
        { date: "2024-12-21", probe: "Teacher Phonics Assessment", result: "65% accuracy (CVC words)" }, 
        { date: "2025-01-11", probe: "DIBELS 8 - PSF", result: 28 }, 
        { date: "2025-01-25", probe: "DIBELS 8 - NWF-CLS", result: 16 }, 
        { date: "2025-01-25", probe: "Teacher Phonics Assessment", result: "70% accuracy (short vowel sounds)" } 
      ], 
      interventionEffectivenessSummary: "Despite intensive, individualized Tier 3 interventions focusing on phonological awareness and explicit phonics instruction, Caleb has demonstrated limited progress in key early literacy skills as measured by DIBELS 8th Edition and teacher-created assessments. His growth trajectory is significantly below expected levels for his grade.", 
      referralDecision: "Recommended for Special Education evaluation to determine if a Specific Learning Disability is impacting his literacy development and to identify appropriate specialized instruction and related services." 
    }, 
    parentCommunication: [ 
      { date: "2024-09-15", type: "Phone call", summary: "Discussed initial concerns regarding Caleb's reading difficulties with parents." }, 
      { date: "2024-09-22", type: "Meeting", summary: "Explained Tier 3 interventions and intensive progress monitoring plan to parents. Obtained consent for Tier 3 services." }, 
      { date: "2024-10-28", type: "Email", summary: "Provided an update on Caleb's progress monitoring data after the first month of Tier 3 intervention." }, 
      { date: "2024-12-02", type: "Meeting", summary: "Discussed continued limited progress despite intensive interventions and the possibility of a special education evaluation." }, 
      { date: "2025-02-05", type: "Meeting", summary: "Formally recommended a Special Education evaluation based on lack of adequate progress in Tier 3 interventions. Provided information about the evaluation process and parental rights." } 
    ], 
    teacherObservations: [ 
      "Caleb demonstrates significant frustration during literacy activities.", 
      "He often guesses at words rather than decoding them.", 
      "He requires significant one-on-one support to complete literacy tasks.", 
      "His progress is markedly slower than his peers despite intensive instruction." 
    ] 
  }
  
  // Chatbot
  const { draftId } = useParams(); // if you still need this for future use
  const { generateIepGoal } = useAi();
  const [goal, setGoal] = useState<string>("");

  async function handleGenerateGoal() {
    const plafp = "Student struggles with reading fluency and decoding multi-syllabic words.";
    const smartGoal = await generateIepGoal({ plafp });
    setGoal(smartGoal);
  }

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
              <TabsTrigger value="mtss">MTSS</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="iep">Individual Evaluation Plan</TabsTrigger>
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
                  <CardTitle>MTSS Overview</CardTitle>
                  <CardDescription>
                    Multi-Tiered System of Supports information and intervention history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm bg-amber-100 border-amber-300">
                      Tier {mtssData.mtssHistory.rtiTier}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Initial concern: {formatDate(mtssData.mtssHistory.dateOfInitialConcern)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reason for Concern</h4>
                    <p className="text-sm text-muted-foreground">
                      {mtssData.mtssHistory.reasonForConcern}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Referral Decision</h4>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {mtssData.mtssHistory.referralDecision}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Interventions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Interventions Implemented</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mtssData.mtssHistory.interventionsImplemented.map((intervention, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{intervention.interventionName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p>{formatDate(intervention.startDate)} - {formatDate(intervention.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Frequency</p>
                            <p>{intervention.frequency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monitoring Tool</p>
                            <p>{intervention.progressMonitoringTool}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monitoring Frequency</p>
                            <p>{intervention.progressMonitoringFrequency}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Progress Monitoring Data */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Progress Monitoring Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 text-sm font-medium">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-medium">Assessment</th>
                          <th className="text-left py-2 px-3 text-sm font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mtssData.mtssHistory.progressMonitoringData.map((data, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-3 text-sm">{formatDate(data.date)}</td>
                            <td className="py-2 px-3 text-sm">{data.probe}</td>
                            <td className="py-2 px-3 text-sm">
                              {typeof data.result === 'number' ? data.result : data.result}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Teacher Observations */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Teacher Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {mtssData.teacherObservations.map((observation, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {observation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Parent Communication */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Parent Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mtssData.parentCommunication.map((communication, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="min-w-[100px]">
                          <Badge variant="outline" className="text-xs">
                            {communication.type}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(communication.date)}
                          </p>
                        </div>
                        <p className="text-sm">{communication.summary}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Effectiveness Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Intervention Effectiveness Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {mtssData.mtssHistory.interventionEffectivenessSummary}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Evaluations Tab */}
            <TabsContent value="evaluations">
              {/* Evaluation Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Summary</CardTitle>
                  <CardDescription>
                    Comprehensive evaluation results and eligibility determination
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm bg-blue-100 border-blue-300">
                      Specific Learning Disability
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Evaluation Date: {formatDate(evaluationsData.psychologicalEvaluation.dateOfEvaluation)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Evaluation Team</h4>
                    <div className="flex flex-wrap gap-2">
                      {evaluationsData.evaluationTeam.map((member, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {member.name} - {member.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Summary of Findings</h4>
                    <p className="text-sm text-muted-foreground">
                      {evaluationsData.evaluationSummary}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Eligibility Recommendation</h4>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {evaluationsData.recommendationForEligibility}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Psychological Evaluation */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Psychological Evaluation</CardTitle>
                  <CardDescription>
                    Conducted on {formatDate(evaluationsData.psychologicalEvaluation.dateOfEvaluation)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Administered Tests */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Administered Tests</h4>
                    <div className="space-y-4">
                      {evaluationsData.psychologicalEvaluation.administeredTests.map((test, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">{test.testName}</h5>
                          <div className="flex flex-wrap gap-2">
                            {test.subtestsAdministered ? (
                              test.subtestsAdministered.map((subtest, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {subtest}
                                </Badge>
                              ))
                            ) : (
                              test.clustersAdministered?.map((cluster, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cluster}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Cognitive Assessment */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Cognitive Assessment Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Full Scale IQ</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.fsIq}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.fsIq} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Verbal Comprehension</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.verbalComprehensionIndex}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.verbalComprehensionIndex} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Visual Spatial</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.visualSpatialIndex}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.visualSpatialIndex} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fluid Reasoning</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.fluidReasoningIndex}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.fluidReasoningIndex} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Working Memory</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.workingMemoryIndex}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.workingMemoryIndex} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Processing Speed</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.processingSpeedIndex}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.processingSpeedIndex} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {evaluationsData.psychologicalEvaluation.cognitiveAssessmentSummary.narrativeSummary}
                      </p>
                    </div>
                  </div>
                  
                  {/* Achievement Assessment */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Achievement Assessment Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Basic Reading Skills</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.basicReadingSkills}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.basicReadingSkills} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Reading Comprehension</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.readingComprehension}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.readingComprehension} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Math Calculation</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.mathCalculationSkills}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.mathCalculationSkills} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Math Problem Solving</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.mathProblemSolving}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.mathProblemSolving} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Written Expression</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.writtenExpression}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.writtenExpression} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Oral Language</span>
                            <span className="font-medium">{evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.oralLanguage}</span>
                          </div>
                          <Progress 
                            value={evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.oralLanguage} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {evaluationsData.psychologicalEvaluation.achievementAssessmentSummary.narrativeSummary}
                      </p>
                    </div>
                  </div>
                  
                  {/* Behavioral Observations */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Behavioral Observations</h4>
                    <p className="text-sm text-muted-foreground">
                      {evaluationsData.psychologicalEvaluation.behavioralObservations}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Speech-Language Evaluation */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Speech-Language Evaluation</CardTitle>
                  <CardDescription>
                    Conducted on {formatDate(evaluationsData.speechLanguageEvaluation.dateOfEvaluation)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Areas Assessed</h4>
                    <div className="flex flex-wrap gap-2">
                      {evaluationsData.speechLanguageEvaluation.areasAssessed.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Findings Summary</h4>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <h5 className="text-sm font-medium mb-1">Phonological Awareness</h5>
                        <p className="text-sm text-muted-foreground">
                          {evaluationsData.speechLanguageEvaluation.findingsSummary.phonologicalAwareness}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="text-sm font-medium mb-1">Phonics Skills</h5>
                        <p className="text-sm text-muted-foreground">
                          {evaluationsData.speechLanguageEvaluation.findingsSummary.phonicsSkills}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="text-sm font-medium mb-1">Oral Language Comprehension</h5>
                        <p className="text-sm text-muted-foreground">
                          {evaluationsData.speechLanguageEvaluation.findingsSummary.oralLanguageComprehension}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="text-sm font-medium mb-1">Expressive Language</h5>
                        <p className="text-sm text-muted-foreground">
                          {evaluationsData.speechLanguageEvaluation.findingsSummary.expressiveLanguage}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="text-sm font-medium mb-1">Articulation</h5>
                        <p className="text-sm text-muted-foreground">
                          {evaluationsData.speechLanguageEvaluation.findingsSummary.articulation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <p className="text-sm text-muted-foreground">
                      {evaluationsData.speechLanguageEvaluation.recommendations}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Occupational Therapy Consult */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Occupational Therapy Consult</CardTitle>
                  <CardDescription>
                    Conducted on {formatDate(evaluationsData.occupationalTherapyConsult.dateOfConsultation)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Areas Observed</h4>
                    <div className="flex flex-wrap gap-2">
                      {evaluationsData.occupationalTherapyConsult.areasObserved.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Findings Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {evaluationsData.occupationalTherapyConsult.findingsSummary}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <p className="text-sm text-muted-foreground">
                      {evaluationsData.occupationalTherapyConsult.recommendations}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IEP Tab */}
            <TabsContent value="iep">
              <Card>
                <CardHeader>
                  <CardTitle>IEP Draft - Auto Goal Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleGenerateGoal}>Generate SMART Goal</Button>

                  {goal && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <h4 className="text-lg font-medium mb-2">Generated SMART Goal:</h4>
                      <p className="text-muted-foreground">{goal}</p>
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
// Evaluations data (hardcoded)
const evaluationsData = { 
  studentIdentification: { 
    studentId: "1357911", 
    firstName: "Caleb", 
    lastName: "Rodriguez", 
    dob: "2018-08-03", 
    grade: 2 
  }, 
  evaluationTeam: [ 
    { name: "Dr. Anya Petrova", role: "School Psychologist" }, 
    { name: "Sarah Chen", role: "Speech-Language Pathologist" }, 
    { name: "Maria Garcia", role: "Occupational Therapist (Consult)" } 
  ], 
  psychologicalEvaluation: { 
    dateOfEvaluation: "2025-05-15", 
    administeredTests: [ 
      { testName: "Wechsler Intelligence Scale for Children - Fifth Edition (WISC-V)", subtestsAdministered: ["Full Scale IQ", "Verbal Comprehension Index", "Visual Spatial Index", "Fluid Reasoning Index", "Working Memory Index", "Processing Speed Index"] }, 
      { testName: "Woodcock-Johnson IV Tests of Achievement", clustersAdministered: ["Basic Reading Skills", "Reading Comprehension", "Math Calculation Skills", "Math Problem Solving", "Written Expression", "Oral Language"] } 
    ], 
    cognitiveAssessmentSummary: { 
      fsIq: 82, 
      verbalComprehensionIndex: 85, 
      visualSpatialIndex: 90, 
      fluidReasoningIndex: 79, 
      workingMemoryIndex: 88, 
      processingSpeedIndex: 83, 
      narrativeSummary: "Caleb's Full Scale IQ falls within the low average range. His relative weaknesses were noted in Fluid Reasoning and Processing Speed. Strengths were observed in his Visual Spatial abilities. His Verbal Comprehension and Working Memory skills were in the average range." 
    }, 
    achievementAssessmentSummary: { 
      basicReadingSkills: 75, 
      readingComprehension: 78, 
      mathCalculationSkills: 88, 
      mathProblemSolving: 85, 
      writtenExpression: 80, 
      oralLanguage: 92, 
      narrativeSummary: "Caleb demonstrated significant weaknesses in Basic Reading Skills and Reading Comprehension, falling in the low range. His Math Calculation and Problem Solving skills were in the average range, as was Written Expression. Oral Language skills were a relative strength, within the average range." 
    }, 
    behavioralObservations: "Caleb was cooperative during testing but exhibited some frustration during tasks requiring phonological manipulation and rapid naming. He required occasional redirection to maintain focus on timed tasks." 
  }, 
  speechLanguageEvaluation: { 
    dateOfEvaluation: "2025-05-10", 
    areasAssessed: ["Phonological Awareness", "Phonics Skills", "Oral Language Comprehension", "Expressive Language", "Articulation"], 
    findingsSummary: { 
      phonologicalAwareness: "Demonstrates significant deficits in phoneme segmentation, blending, and manipulation skills, scoring significantly below age expectations.", 
      phonicsSkills: "Struggles with letter-sound correspondence and decoding single and multi-syllabic words. Relies heavily on guessing.", 
      oralLanguageComprehension: "Age-appropriate receptive vocabulary and understanding of basic sentence structures.", 
      expressiveLanguage: "Generally age-appropriate expressive vocabulary and sentence formation, but some difficulty with complex sentence structures when describing events.", 
      articulation: "All phonemes were produced within normal limits." 
    }, 
    recommendations: "Continued speech-language support focusing on explicit and systematic instruction in phonological awareness and phonics skills is recommended to improve Caleb's foundational reading abilities." 
  }, 
  occupationalTherapyConsult: { 
    dateOfConsultation: "2025-05-08", 
    areasObserved: ["Fine Motor Skills", "Gross Motor Skills", "Sensory Processing"], 
    findingsSummary: "No significant concerns noted in fine or gross motor skills. Teacher report indicates occasional difficulties with organization of written work, but direct observation did not reveal significant fine motor deficits. No significant sensory processing concerns reported or observed.", 
    recommendations: "No direct occupational therapy services recommended at this time. Strategies for visual organization of written work may be beneficial." 
  }, 
  evaluationSummary: "Based on the comprehensive evaluations, Caleb presents with significant deficits in basic reading skills and phonological awareness, impacting his reading fluency and comprehension. Cognitive testing reveals a relative weakness in fluid reasoning and processing speed. These findings are consistent with a Specific Learning Disability in Reading (Dyslexia).", 
  recommendationForEligibility: "Based on the evaluation data, Caleb meets the criteria for a Specific Learning Disability under federal and state guidelines. An IEP is recommended to provide specialized instruction and related services to address his identified needs." 
}

