"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Users, BookOpen, Calendar, Pencil, Trash2, ArrowLeft, Search } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"

interface AssignmentFormData {
  title: string
  description: string
  dueDate: string
}

export default function CourseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string
  
  const courseDetails = useQuery(api.courses.getCourseDetails, { 
    courseId: courseId as Id<"courses"> 
  })
  const assignments = useQuery(api.courses.listCourseAssignments, { 
    courseId: courseId as Id<"courses"> 
  })
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddingAssignment, setIsAddingAssignment] = useState(false)
  const [isEditingAssignment, setIsEditingAssignment] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormData>({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split('T')[0]
  })
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  
  const createAssignment = useMutation(api.courses.createAssignment)
  const updateAssignment = useMutation(api.courses.updateAssignment)
  const deleteAssignment = useMutation(api.courses.deleteAssignment)
  
  const [addStudentsDialogOpen, setAddStudentsDialogOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<Id<"users">[]>([])
  
  const potentialStudents = useQuery(api.users.listPotentialStudents, {
    search: studentSearch
  })
  
  const addStudentsToCourse = useMutation(api.courses.addStudentsToCourse)
  const removeStudentFromCourse = useMutation(api.courses.removeStudentsFromCourse)
  
  const handleAddAssignment = () => {
    setIsAddingAssignment(true)
    setIsEditingAssignment(false)
    setSelectedAssignment(null)
    setAssignmentForm({
      title: "",
      description: "",
      dueDate: new Date().toISOString().split('T')[0]
    })
    setAssignmentDialogOpen(true)
  }
  
  const handleEditAssignment = (assignment: any) => {
    setIsAddingAssignment(false)
    setIsEditingAssignment(true)
    setSelectedAssignment(assignment)
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate).toISOString().split('T')[0]
    })
    setAssignmentDialogOpen(true)
  }
  
  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAssignmentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isAddingAssignment) {
        await createAssignment({
          courseId: courseId as Id<"courses">,
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: new Date(assignmentForm.dueDate).getTime()
        })
        toast.success("Assignment created successfully")
      } else if (isEditingAssignment && selectedAssignment) {
        await updateAssignment({
          assignmentId: selectedAssignment._id,
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: new Date(assignmentForm.dueDate).getTime()
        })
        toast.success("Assignment updated successfully")
      }
      
      setAssignmentDialogOpen(false)
    } catch (error) {
      toast.error(isAddingAssignment ? "Failed to create assignment" : "Failed to update assignment")
      console.error(error)
    }
  }
  
  const handleDeleteAssignment = async (assignmentId: Id<"assignments">) => {
    try {
      await deleteAssignment({ assignmentId })
      toast.success("Assignment deleted successfully")
    } catch (error) {
      toast.error("Failed to delete assignment")
      console.error(error)
    }
  }
  
  const handleOpenAddStudentsDialog = () => {
    setSelectedStudentIds([])
    setStudentSearch("")
    setAddStudentsDialogOpen(true)
  }
  
  const handleStudentSelectionChange = (studentId: Id<"users">, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId])
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId))
    }
  }
  
  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student")
      return
    }
    
    try {
      await addStudentsToCourse({
        courseId: courseId as Id<"courses">,
        studentIds: selectedStudentIds
      })
      toast.success("Students added successfully")
      setAddStudentsDialogOpen(false)
    } catch (error) {
      toast.error("Failed to add students")
      console.error(error)
    }
  }
  
  const handleRemoveStudent = async (studentId: Id<"users">) => {
    try {
      await removeStudentFromCourse({
        courseId: courseId as Id<"courses">,
        studentIds: [studentId]
      })
      toast.success("Student removed successfully")
    } catch (error) {
      toast.error("Failed to remove student")
      console.error(error)
    }
  }
  
  if (courseDetails === undefined) {
    return (
      <div className="container flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (!courseDetails) {
    return (
      <div className="container">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
          <h3 className="text-lg font-medium">Course not found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push('/protected/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push('/protected/courses')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight">{courseDetails.name}</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Basic details about this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground mt-1">{courseDetails.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Students Enrolled</h3>
                  <p className="text-muted-foreground mt-1">{courseDetails.students.length} students</p>
                </div>
                <div>
                  <h3 className="font-medium">Assignments</h3>
                  <p className="text-muted-foreground mt-1">{assignments?.length || 0} assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments === undefined ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : assignments.length === 0 ? (
                  <p className="text-muted-foreground">No assignments yet</p>
                ) : (
                  <ul className="space-y-2">
                    {assignments.slice(0, 3).map((assignment) => (
                      <li key={assignment._id} className="flex justify-between items-center">
                        <span>{assignment.title}</span>
                        <span className="text-sm text-muted-foreground">
                          Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("assignments")}>
                  View All Assignments
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Students</CardTitle>
              </CardHeader>
              <CardContent>
                {courseDetails.students.length === 0 ? (
                  <p className="text-muted-foreground">No students enrolled yet</p>
                ) : (
                  <ul className="space-y-2">
                    {courseDetails.students.slice(0, 5).map((student) => (
                      <li key={student._id} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="font-medium">{student.name || 'Unnamed Student'}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("students")}>
                  View All Students
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  {courseDetails.students.length} students in this course
                </CardDescription>
              </div>
              <Button onClick={handleOpenAddStudentsDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Students
              </Button>
            </CardHeader>
            <CardContent>
              {courseDetails.students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No students enrolled</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Add students to this course to get started
                  </p>
                  <Button onClick={handleOpenAddStudentsDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Students
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-3 p-4 font-medium border-b">
                    <div>Name</div>
                    <div>Email</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {courseDetails.students.map((student) => (
                    <div key={student._id} className="grid grid-cols-3 p-4 border-b last:border-0 items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span>{student.name || 'Unnamed Student'}</span>
                      </div>
                      <div className="text-muted-foreground">{student.email}</div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/protected/students/${student._id}`)}
                        >
                          View Profile
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this student from the course? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveStudent(student._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Assignments</CardTitle>
                <CardDescription>
                  Manage assignments for this course
                </CardDescription>
              </div>
              <Button onClick={handleAddAssignment}>
                <Plus className="mr-2 h-4 w-4" />
                Add Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {assignments === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No assignments yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Create your first assignment for this course
                  </p>
                  <Button onClick={handleAddAssignment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assignment
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-4 p-4 font-medium border-b">
                    <div>Title</div>
                    <div>Description</div>
                    <div>Due Date</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {assignments.map((assignment) => (
                    <div key={assignment._id} className="grid grid-cols-4 p-4 border-b last:border-0 items-center">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-muted-foreground truncate">{assignment.description}</div>
                      <div>{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this assignment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteAssignment(assignment._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAssignmentSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isAddingAssignment ? "Add New Assignment" : "Edit Assignment"}
              </DialogTitle>
              <DialogDescription>
                {isAddingAssignment 
                  ? "Create a new assignment for this course." 
                  : "Update the details of this assignment."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={assignmentForm.title}
                  onChange={handleAssignmentFormChange}
                  placeholder="Midterm Exam"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={assignmentForm.description}
                  onChange={handleAssignmentFormChange}
                  placeholder="Comprehensive exam covering chapters 1-5..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={handleAssignmentFormChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isAddingAssignment ? "Create Assignment" : "Update Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={addStudentsDialogOpen} onOpenChange={setAddStudentsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Students to Course</DialogTitle>
            <DialogDescription>
              Select students to add to this course.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            
            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              {potentialStudents === undefined ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : potentialStudents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No students found
                </div>
              ) : (
                <div>
                  {potentialStudents.map((student) => {
                    const isEnrolled = courseDetails.students.some(
                      (s) => s._id === student._id
                    )
                    
                    return (
                      <div key={student._id} className="flex items-center p-3 border-b last:border-0">
                        <Checkbox 
                          id={`student-${student._id}`}
                          checked={selectedStudentIds.includes(student._id)}
                          onCheckedChange={(checked) => 
                            handleStudentSelectionChange(student._id, checked as boolean)
                          }
                          disabled={isEnrolled}
                          className="mr-3"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <Label 
                              htmlFor={`student-${student._id}`}
                              className="font-medium cursor-pointer"
                            >
                              {student.name || 'Unnamed Student'}
                            </Label>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        {isEnrolled && (
                          <span className="text-xs text-muted-foreground">Already enrolled</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddStudentsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddStudents}
              disabled={selectedStudentIds.length === 0}
            >
              Add Selected Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}