"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Checkbox } from "@/app/components/ui/checkbox"
import { CheckCircle2, Clock, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "completed" | "expired"
  dueDate?: string
  campaignId: string
  rewardType: "discount" | "payout"
  rewardValue: string
}

interface TaskListProps {
  tasks: Task[]
  campaignId: string
  isReferrer?: boolean
}

export function TaskList({ tasks, campaignId, isReferrer = false }: TaskListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  
  const toggleTaskExpand = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
    } else {
      setExpandedTaskId(taskId)
    }
  }
  
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="h-3 w-3" />
            <span>Expired</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        )
    }
  }
  
  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">No tasks available for this campaign.</p>
          {isReferrer && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/campaigns/${campaignId}/tasks/create`}>
                Create a Task
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className={task.status === "completed" ? "bg-muted/50" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                {isReferrer && (
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.status === "completed"}
                    disabled
                    className="mt-1"
                  />
                )}
                <div>
                  <CardTitle className="text-base">
                    <button 
                      onClick={() => toggleTaskExpand(task.id)}
                      className="text-left hover:underline focus:outline-none focus:underline"
                    >
                      {task.title}
                    </button>
                  </CardTitle>
                  {task.dueDate && (
                    <CardDescription>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </CardDescription>
                  )}
                </div>
              </div>
              {getStatusBadge(task.status)}
            </div>
          </CardHeader>
          
          {(expandedTaskId === task.id || !isReferrer) && (
            <>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">Reward: </span>
                  {task.rewardType === "discount" ? "Discount" : "Cash"} - {task.rewardValue}
                </div>
              </CardContent>
              
              <CardFooter>
                {isReferrer ? (
                  <div className="flex justify-between w-full">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/campaigns/${campaignId}/tasks/${task.id}/edit`}>
                        Edit Task
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/campaigns/${campaignId}/tasks/${task.id}/stats`}>
                        View Stats
                      </Link>
                    </Button>
                  </div>
                ) : (
                  task.status === "pending" && (
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/referral-tasks/${campaignId}/${task.id}`}>
                        Complete Task
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )
                )}
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  )
} 