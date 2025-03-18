"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Task, TaskStatus } from "@/types/api";

interface TaskManagerProps {
  campaignId: string;
}

interface TaskError {
  message: string;
  code?: string;
}

export function TaskManager({ campaignId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TaskError | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaign-tasks?campaignId=${campaignId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json() as Task[];
      setTasks(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Failed to fetch tasks",
        code: "FETCH_ERROR"
      });
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  const handleCreateTask = async (taskData: Omit<Task, "id">) => {
    try {
      const response = await fetch("/api/campaign-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskData, campaignId }),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      const newTask = await response.json() as Task;
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Failed to create task",
        code: "CREATE_ERROR"
      });
    }
  };

  const handleUpdateTask = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/campaign-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Failed to update task",
        code: "UPDATE_ERROR"
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/campaign-tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Failed to delete task",
        code: "DELETE_ERROR"
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [campaignId, fetchTasks]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center space-y-4">
            <div>No tasks found</div>
            <Button onClick={() => handleCreateTask({
              title: "New Task",
              description: "Task description",
              points: 100,
              type: "social",
              status: "active",
              requirements: [],
              campaignId
            })}>
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p>Status: {task.status}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    onClick={() => handleUpdateTask(task.id, task.status === "active" ? "inactive" : "active")}
                  >
                    {task.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 