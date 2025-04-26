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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Plus, Megaphone, Pencil, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"

interface AnnouncementFormData {
  title: string
  content: string
  courseId: string | null
}

export default function AnnouncementsPage() {
  // State
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    courseId: null
  })

  // Queries
  const announcements = useQuery(api.announcements.listAnnouncements, {
    courseId: selectedCourseFilter ? (selectedCourseFilter as Id<"courses">) : undefined
  })
  const courses = useQuery(api.courses.listTeacherCourses)

  // Mutations
  const createAnnouncement = useMutation(api.announcements.createAnnouncement)
  const updateAnnouncement = useMutation(api.announcements.updateAnnouncement)
  const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement)

  // Handlers
  const handleCreateAnnouncement = () => {
    setIsEditing(false)
    setSelectedAnnouncement(null)
    setFormData({
      title: "",
      content: "",
      courseId: null
    })
    setIsDialogOpen(true)
  }

  const handleEditAnnouncement = (announcement: any) => {
    setIsEditing(true)
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.courseId || null
    })
    setIsDialogOpen(true)
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCourseChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      courseId: value === "school-wide" ? null : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditing && selectedAnnouncement) {
        await updateAnnouncement({
          announcementId: selectedAnnouncement._id,
          title: formData.title,
          content: formData.content,
          courseId: formData.courseId ? (formData.courseId as Id<"courses">) : undefined
        })
        toast.success("Announcement updated successfully")
      } else {
        await createAnnouncement({
          title: formData.title,
          content: formData.content,
          courseId: formData.courseId ? (formData.courseId as Id<"courses">) : undefined
        })
        toast.success("Announcement created successfully")
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(isEditing ? "Failed to update announcement" : "Failed to create announcement")
      console.error(error)
    }
  }

  const handleDelete = async (announcementId: Id<"announcements">) => {
    try {
      await deleteAnnouncement({ announcementId })
      toast.success("Announcement deleted successfully")
    } catch (error) {
      toast.error("Failed to delete announcement")
      console.error(error)
    }
  }

  // Animation variants
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

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight">Announcements</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select
            value={selectedCourseFilter || "all"}
            onValueChange={(value) => setSelectedCourseFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Announcements</SelectItem>
              <SelectItem value="school-wide">School-wide Only</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateAnnouncement}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {announcements === undefined ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No announcements yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Create your first announcement to share information with your students
          </p>
          <Button onClick={handleCreateAnnouncement}>
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </div>
      ) : (
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {announcements.map((announcement) => (
            <motion.div key={announcement._id} variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(announcement.date), 'MMM d, yyyy')}
                        {announcement.course ? (
                          <span className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {announcement.course.name}
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            School-wide
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditAnnouncement(announcement)}
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
                            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this announcement? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(announcement._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{announcement.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Announcement" : "Create New Announcement"}
              </DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update the details of your announcement." 
                  : "Create a new announcement to share with your students."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Important Update"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  placeholder="Write your announcement here..."
                  className="min-h-[150px]"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseId">Announcement Type</Label>
                <Select
                  value={formData.courseId === null ? "school-wide" : formData.courseId}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Select announcement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school-wide">School-wide Announcement</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name} Only
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Announcement" : "Create Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}