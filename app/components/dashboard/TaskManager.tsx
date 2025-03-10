import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Copy,
  Check
} from "lucide-react";

interface Task {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  completionCriteria: string;
  rewardType: 'discount' | 'payout';
  rewardValue: string;
  status: 'active' | 'completed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCompletion {
  id: string;
  taskId: string;
  referrerId: string;
  refereeId: string;
  completionDate: Date;
  status: 'pending' | 'verified' | 'rejected';
  verificationMethod?: string;
  verificationData?: any;
  rewardStatus: 'pending' | 'issued' | 'claimed';
  rewardDetails?: any;
}

interface TaskManagerProps {
  campaignId: string;
}

export function TaskManager({ campaignId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // New task form state
  const [newTask, setNewTask] = useState<Partial<Task>>({
    campaignId,
    title: '',
    description: '',
    completionCriteria: '',
    rewardType: 'discount',
    rewardValue: '',
    status: 'active',
  });
  
  useEffect(() => {
    fetchTasks();
  }, [campaignId]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      const response = await fetch(`/api/campaign-tasks?campaignId=${campaignId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTasks(data.tasks || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCompletions = async (taskId: string) => {
    try {
      // In a real app, this would be an API call
      const response = await fetch(`/api/task-completions?taskId=${taskId}`);
      const data = await response.json();
      
      if (response.ok) {
        setCompletions(data.completions || []);
      } else {
        console.error('Failed to fetch completions:', data.error);
      }
    } catch (err) {
      console.error('Error fetching completions:', err);
    }
  };
  
  const handleCreateTask = async () => {
    try {
      // In a real app, this would be an API call
      const response = await fetch('/api/campaign-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTasks([...tasks, data.task]);
        setNewTask({
          campaignId,
          title: '',
          description: '',
          completionCriteria: '',
          rewardType: 'discount',
          rewardValue: '',
          status: 'active',
        });
        setIsCreating(false);
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error creating task:', err);
    }
  };
  
  const handleUpdateTask = async () => {
    if (!activeTask) return;
    
    try {
      // In a real app, this would be an API call
      const response = await fetch('/api/campaign-tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activeTask),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTasks(tasks.map(task => task.id === activeTask.id ? data.task : task));
        setActiveTask(null);
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error updating task:', err);
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    try {
      // In a real app, this would be an API call
      const response = await fetch(`/api/campaign-tasks?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
        if (activeTask?.id === id) {
          setActiveTask(null);
          setIsEditing(false);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete task');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error deleting task:', err);
    }
  };
  
  const handleVerifyCompletion = async (completionId: string, isVerified: boolean) => {
    try {
      // In a real app, this would be an API call
      const response = await fetch('/api/task-completions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: completionId,
          status: isVerified ? 'verified' : 'rejected',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCompletions(completions.map(completion => 
          completion.id === completionId ? data.completion : completion
        ));
      } else {
        setError(data.error || 'Failed to update completion');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error updating completion:', err);
    }
  };
  
  const handleCopyReferralLink = (taskId: string) => {
    // In a real app, this would generate a unique referral link
    const referralLink = `https://referly.com/refer/${campaignId}/${taskId}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getCompletionStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getRewardStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge className="bg-blue-500">Issued</Badge>;
      case 'claimed':
        return <Badge className="bg-green-500">Claimed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign Tasks</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      )}
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Define a task for referees to complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="e.g. Sign up for a free trial"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Describe what the referee needs to do"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completionCriteria">Completion Criteria</Label>
              <Textarea 
                id="completionCriteria" 
                value={newTask.completionCriteria}
                onChange={(e) => setNewTask({...newTask, completionCriteria: e.target.value})}
                placeholder="Specify how task completion will be verified"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rewardType">Reward Type</Label>
                <Select 
                  value={newTask.rewardType}
                  onValueChange={(value: 'discount' | 'payout') => setNewTask({...newTask, rewardType: value})}
                >
                  <SelectTrigger id="rewardType">
                    <SelectValue placeholder="Select reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="payout">Cash Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rewardValue">Reward Value</Label>
                <Input 
                  id="rewardValue" 
                  value={newTask.rewardValue}
                  onChange={(e) => setNewTask({...newTask, rewardValue: e.target.value})}
                  placeholder={newTask.rewardType === 'discount' ? "e.g. 25%" : "e.g. $50"}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={newTask.status === 'active'}
                onCheckedChange={(checked) => setNewTask({...newTask, status: checked ? 'active' : 'pending'})}
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {tasks.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No tasks created for this campaign yet.</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{task.title}</CardTitle>
                  {getStatusBadge(task.status)}
                </div>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="font-medium">
                      {task.rewardType === 'discount' ? `${task.rewardValue} Discount` : `${task.rewardValue} Payout`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setActiveTask(task);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    setActiveTask(task);
                    fetchCompletions(task.id);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {activeTask && !isEditing && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{activeTask.title}</CardTitle>
                <CardDescription>{activeTask.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteTask(activeTask.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Task Details</TabsTrigger>
                <TabsTrigger value="completions">Completions</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Task Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(activeTask.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(activeTask.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(activeTask.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Reward Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize">{activeTask.rewardType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span>{activeTask.rewardValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Completion Criteria</h3>
                  <p className="text-sm">{activeTask.completionCriteria}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="completions" className="mt-4">
                {completions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No completions yet for this task.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completions.map((completion) => (
                      <Card key={completion.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base">
                                Completion #{completion.id.split('-')[1]}
                              </CardTitle>
                              <CardDescription>
                                Referrer: {completion.referrerId} • Referee: {completion.refereeId}
                              </CardDescription>
                            </div>
                            {getCompletionStatusBadge(completion.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Completion Date:</p>
                              <p>{new Date(completion.completionDate).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reward Status:</p>
                              <p>{getRewardStatusBadge(completion.rewardStatus)}</p>
                            </div>
                          </div>
                        </CardContent>
                        {completion.status === 'pending' && (
                          <CardFooter className="flex justify-end space-x-2 pt-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerifyCompletion(completion.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleVerifyCompletion(completion.id, true)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </CardFooter>
                        )}
                        {completion.rewardStatus === 'issued' && (
                          <CardFooter className="pt-0">
                            <div className="w-full p-2 bg-muted rounded-md text-xs">
                              <div className="flex justify-between items-center">
                                <span>
                                  {completion.rewardDetails.type === 'discount' 
                                    ? `Discount Code: ${completion.rewardDetails.code}` 
                                    : `Payout: ${completion.rewardDetails.value}`}
                                </span>
                                <span>
                                  {completion.rewardDetails.expiryDate && 
                                    `Expires: ${new Date(completion.rewardDetails.expiryDate).toLocaleDateString()}`}
                                </span>
                              </div>
                            </div>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="share" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Referral Link</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                      https://referly.com/refer/{campaignId}/{activeTask.id}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleCopyReferralLink(activeTask.id)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with your customers. They can share it with their network to earn rewards.
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-md">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">How it works</h4>
                      <ol className="text-xs text-muted-foreground mt-1 space-y-1 list-decimal pl-4">
                        <li>Share this link with your existing customers</li>
                        <li>They share it with potential new customers</li>
                        <li>When a new customer completes the task, both get rewarded</li>
                        <li>You verify task completion and rewards are issued automatically</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {isEditing && activeTask && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Task</CardTitle>
            <CardDescription>Update task details and rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Task Title</Label>
              <Input 
                id="edit-title" 
                value={activeTask.title}
                onChange={(e) => setActiveTask({...activeTask, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={activeTask.description}
                onChange={(e) => setActiveTask({...activeTask, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-completionCriteria">Completion Criteria</Label>
              <Textarea 
                id="edit-completionCriteria" 
                value={activeTask.completionCriteria}
                onChange={(e) => setActiveTask({...activeTask, completionCriteria: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rewardType">Reward Type</Label>
                <Select 
                  value={activeTask.rewardType}
                  onValueChange={(value: 'discount' | 'payout') => setActiveTask({...activeTask, rewardType: value})}
                >
                  <SelectTrigger id="edit-rewardType">
                    <SelectValue placeholder="Select reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="payout">Cash Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-rewardValue">Reward Value</Label>
                <Input 
                  id="edit-rewardValue" 
                  value={activeTask.rewardValue}
                  onChange={(e) => setActiveTask({...activeTask, rewardValue: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={activeTask.status}
                onValueChange={(value: 'active' | 'completed' | 'pending') => setActiveTask({...activeTask, status: value})}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setActiveTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 