import os
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    color = models.CharField(max_length=7, default="#3B82F6")
    avatar = models.URLField(blank=True, null=True) 

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Label(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('inprogress', 'In Progress'),
        ('done', 'Done'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='tasks')
    due_date = models.DateField()
    labels = models.ManyToManyField(Label, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def attachment_count(self):
        return 0  # placeholder

    def comment_count(self):
        return 0  # placeholder

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

def attachment_upload_path(instance, filename):
    return f"attachments/task_{instance.task.id}/{filename}"

class Attachment(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to=attachment_upload_path)
    original_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def name(self):
        return os.path.basename(self.file.name)

    def type(self):
        return self.file.file.content_type if hasattr(self.file, 'file') else ""

    def size(self):
        return self.file.size if self.file else 0

    def url(self):
        return self.file.url
    
class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ('task_created', 'Task Created'),
        ('task_updated', 'Task Updated'),
        ('task_moved', 'Task Moved'),
        ('task_deleted', 'Task Deleted'),
    ]

    type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    message = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True)
    from_status = models.CharField(max_length=20, null=True, blank=True)
    to_status = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)