from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Label, Task, Comment, Attachment, ActivityLog

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id', 'username', 'email', 'color', 'avatar', 'is_staff')
    search_fields = ('username', 'email')
    ordering = ('email',)
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('color', 'avatar')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('color', 'avatar')}),
    )

@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'color', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'assignee', 'due_date', 'created_at')
    list_filter = ('status', 'due_date')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    filter_horizontal = ('labels',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'task', 'author', 'created_at', 'updated_at')
    search_fields = ('content',)
    ordering = ('-created_at',)

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'task', 'uploaded_by', 'original_name', 'uploaded_at')
    ordering = ('-uploaded_at',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'user', 'task', 'from_status', 'to_status', 'created_at')
    list_filter = ('type', 'from_status', 'to_status')
    search_fields = ('message',)
    ordering = ('-created_at',)
