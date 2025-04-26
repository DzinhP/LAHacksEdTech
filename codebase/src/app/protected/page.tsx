"use client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BookOpen, GraduationCap, Calendar, TrendingUp, Users } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"
import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Chart data for student performance
const performanceData = [
  { month: "January", attendance: 92, grades: 85 },
  { month: "February", attendance: 88, grades: 82 },
  { month: "March", attendance: 95, grades: 88 },
  { month: "April", attendance: 90, grades: 86 },
  { month: "May", attendance: 93, grades: 90 },
  { month: "June", attendance: 96, grades: 92 },
];

// Chart data for course enrollment
const enrollmentData = [
  { month: "January", newStudents: 12, totalStudents: 45 },
  { month: "February", newStudents: 8, totalStudents: 53 },
  { month: "March", newStudents: 10, totalStudents: 63 },
  { month: "April", newStudents: 5, totalStudents: 68 },
  { month: "May", newStudents: 7, totalStudents: 75 },
  { month: "June", newStudents: 9, totalStudents: 84 },
];

// Chart data for subject distribution
const subjectData = [
  { subject: "Math", students: 28, fill: "var(--color-math)" },
  { subject: "Science", students: 22, fill: "var(--color-science)" },
  { subject: "English", students: 25, fill: "var(--color-english)" },
  { subject: "History", students: 18, fill: "var(--color-history)" },
  { subject: "Art", students: 12, fill: "var(--color-art)" },
];

// Chart configs
const performanceChartConfig = {
  attendance: {
    label: "Attendance",
    color: "hsl(var(--chart-1))",
  },
  grades: {
    label: "Grades",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const enrollmentChartConfig = {
  newStudents: {
    label: "New Students",
    color: "hsl(var(--chart-1))",
  },
  totalStudents: {
    label: "Total Students",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const subjectChartConfig = {
  students: {
    label: "Students",
  },
  math: {
    label: "Math",
    color: "hsl(var(--chart-1))",
  },
  science: {
    label: "Science",
    color: "hsl(var(--chart-2))",
  },
  english: {
    label: "English",
    color: "hsl(var(--chart-3))",
  },
  history: {
    label: "History",
    color: "hsl(var(--chart-4))",
  },
  art: {
    label: "Art",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function ProtectedPage() {
  const router = useRouter()
  const courses = useQuery(api.courses.listTeacherCourses)
  const students = useQuery(api.students.listStudents)
  
  const totalStudents = students?.length || 0
  const totalCourses = courses?.length || 0
  
  const totalSubjects = React.useMemo(() => {
    return subjectData.reduce((acc, curr) => acc + curr.students, 0)
  }, []);

  return (
    <div className="container">
      <h2 className="text-xl font-bold mb-6 tracking-tight">Teacher Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all your courses
            </p>
          </CardContent>
          <CardFooter className="p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs"
              onClick={() => router.push('/protected/students')}
            >
              View all students
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Currently teaching
            </p>
          </CardContent>
          <CardFooter className="p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs"
              onClick={() => router.push('/protected/courses')}
            >
              Manage courses
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
          <CardFooter className="p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs"
              onClick={() => router.push('/protected/students')}
            >
              View attendance
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Posted this week
            </p>
          </CardContent>
          <CardFooter className="p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs"
              onClick={() => router.push('/protected/announcements')}
            >
              Post announcement
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>
              Average attendance and grades
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={performanceChartConfig}>
              <AreaChart
                accessibilityLayer
                data={performanceData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                style={{
                  "--color-attendance": "hsl(var(--chart-1))",
                  "--color-grades": "hsl(var(--chart-2))",
                } as React.CSSProperties}
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="attendance"
                  type="monotone"
                  fill="var(--color-attendance)"
                  fillOpacity={0.2}
                  stroke="var(--color-attendance)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="grades"
                  type="monotone"
                  fill="var(--color-grades)"
                  fillOpacity={0.2}
                  stroke="var(--color-grades)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Improving by 3.5% this semester <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  January - June 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Enrollment Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Student Enrollment</CardTitle>
            <CardDescription>New and total students</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={enrollmentChartConfig}>
              <BarChart accessibilityLayer data={enrollmentData} style={{
                "--color-newStudents": "hsl(var(--chart-1))",
                "--color-totalStudents": "hsl(var(--chart-2))",
              } as React.CSSProperties}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="newStudents" fill="var(--color-newStudents)" radius={4} />
                <Bar dataKey="totalStudents" fill="var(--color-totalStudents)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Growing by 12% this semester <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
            </div>
            <div className="leading-none text-muted-foreground">
              Steady growth in all courses
            </div>
          </CardFooter>
        </Card>

        {/* Subject Distribution Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Students by subject</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={subjectChartConfig}
              className="mx-auto aspect-square max-h-[180px]"
              style={{
                "--color-math": "hsl(var(--chart-1))",
                "--color-science": "hsl(var(--chart-2))",
                "--color-english": "hsl(var(--chart-3))",
                "--color-history": "hsl(var(--chart-4))",
                "--color-art": "hsl(var(--chart-5))",
              } as React.CSSProperties}
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={subjectData}
                  dataKey="students"
                  nameKey="subject"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalSubjects}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Students
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Math and Science are most popular
            </div>
            <div className="leading-none text-muted-foreground">
              Based on current enrollment
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}