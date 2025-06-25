from datetime import datetime
from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'color', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'color']

    def create(self, validated_data):
        # Fallback: use email as username if username is missing or blank
        username = validated_data.get('username') or validated_data['email']

        user = CustomUser.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'color', 'avatar', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class LabelSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'createdAt']

class TaskSerializer(serializers.ModelSerializer):
    assigneeId = serializers.PrimaryKeyRelatedField(
        source='assignee', queryset=CustomUser.objects.all(), write_only=True, required=False, allow_null=True 
    )
    
    assigneeName = serializers.CharField(source='assignee.username', read_only=True)
    labelIds = serializers.PrimaryKeyRelatedField(
        source='labels', many=True, queryset=Label.objects.all(), write_only=True, required=False
    )
    labels = LabelSerializer(read_only=True, many=True)
    attachmentCount = serializers.SerializerMethodField()
    commentCount = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'assigneeId', 'assigneeName',
            'due_date', 'created_at', 'updated_at', 'labelIds', 'labels',
            'attachmentCount', 'commentCount'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_attachmentCount(self, obj):
        return obj.attachment_count()

    def get_commentCount(self, obj):
        return obj.comment_count()

class CommentSerializer(serializers.ModelSerializer):
    authorId = serializers.PrimaryKeyRelatedField(source='author', read_only=True)
    authorName = serializers.CharField(source='author.username', read_only=True)
    authorColor = serializers.CharField(source='author.color', read_only=True)
    taskId = serializers.PrimaryKeyRelatedField(source='task', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'content',
            'authorId', 'authorName', 'authorColor',
            'taskId', 'created_at', 'updated_at'
        ]
        read_only_fields = ['authorId', 'authorName', 'authorColor', 'taskId', 'created_at', 'updated_at']


class AttachmentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    originalName = serializers.CharField(source='original_name', read_only=True)
    url = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    uploadedBy = serializers.PrimaryKeyRelatedField(source='uploaded_by', read_only=True)
    uploadedByName = serializers.CharField(source='uploaded_by.username', read_only=True)
    taskId = serializers.PrimaryKeyRelatedField(source='task', read_only=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)

    class Meta:
        model = Attachment
        fields = [
            'id', 'name', 'originalName', 'url', 'type', 'size',
            'taskId', 'uploadedBy', 'uploadedByName', 'uploadedAt'
        ]

    def get_name(self, obj):
        return obj.name()

    def get_url(self, obj):
        return obj.url()

    def get_type(self, obj):
        return obj.type()

    def get_size(self, obj):
        return obj.size()
    
class ActivityLogSerializer(serializers.ModelSerializer):
    userId = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    userName = serializers.CharField(source='user.username', read_only=True)
    taskId = serializers.PrimaryKeyRelatedField(source='task', read_only=True)
    taskTitle = serializers.CharField(source='task.title', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'type', 'message', 'userId', 'userName',
            'taskId', 'taskTitle', 'from_status', 'to_status', 'createdAt'
        ]