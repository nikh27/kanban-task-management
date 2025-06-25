from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import FileResponse, Http404
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now, timedelta
from django.db.models import Count, Q

from .models import *
from .serializers import *

from django.contrib.auth import get_user_model
User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'token': str(refresh.access_token),
        'refreshToken': str(refresh),
    }

class RegisterView(APIView):
    def post(self, request):
        print("METHOD:", request.method)
        print("DATA RECEIVED:", request.data)

        print("📥 Incoming Registration Data:", request.data)  # Log incoming JSON

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            print("✅ User registered successfully:", user.email)

            return Response({
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    **tokens
                }
            }, status=status.HTTP_201_CREATED)

        print("❌ Registration failed with errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            tokens = get_tokens_for_user(user)
            return Response({
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    **tokens
                }
            })
        return Response({'error': 'Invalid credentials'}, status=400)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refreshToken"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"success": True, "message": "Logged out"}, status=200)
        except Exception:
            return Response({"error": "Invalid token"}, status=400)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "success": True,
            "data": {
                "user": UserSerializer(user).data
            }
        })


class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def list(self, request):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response({"success": True, "data": serializer.data})
    

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response({"success": True, "data": serializer.data})

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"success": True, "message": "User deleted successfully"})
    



class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.select_related('assignee').prefetch_related('labels').all()
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'assignee']
    search_fields = ['title', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()
        labels = self.request.GET.get('labels')
        if labels:
            label_ids = labels.split(',')
            queryset = queryset.filter(labels__id__in=label_ids).distinct()
        return queryset

    def list(self, request):
        queryset = self.paginate_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return self.get_paginated_response({
            "success": True,
            "data": serializer.data
        })

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.select_related('assignee').prefetch_related('labels')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data})
        return Response(serializer.errors, status=400)

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return Response({"success": True, "message": "Task deleted"})


class TaskStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        task = Task.objects.get(pk=pk)
        task.status = request.data.get('status', task.status)
        task.save()
        return Response({"success": True, "data": TaskSerializer(task).data})


class TaskAssigneeUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        task = Task.objects.get(pk=pk)
        user_id = request.data.get('assigneeId')
        if user_id:
            task.assignee_id = user_id
            task.save()
        return Response({"success": True, "data": TaskSerializer(task).data})
    

class LabelListCreateView(generics.ListCreateAPIView):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [AllowAny]

    def list(self, request):
        labels = self.get_queryset()
        serializer = self.get_serializer(labels, many=True)
        return Response({"success": True, "data": serializer.data})

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            label = serializer.save()
            return Response({"success": True, "data": self.get_serializer(label).data}, status=201)
        return Response(serializer.errors, status=400)


class LabelUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, *args, **kwargs):
        label = self.get_object()
        serializer = self.get_serializer(label, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data})
        return Response(serializer.errors, status=400)

    def delete(self, request, *args, **kwargs):
        self.get_object().delete()
        return Response({"success": True, "message": "Label deleted"})
    
class TaskCommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, task_id):
        comments = Comment.objects.filter(task_id=task_id).select_related('author')
        serializer = CommentSerializer(comments, many=True)
        return Response({"success": True, "data": serializer.data})

    def post(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response({"success": True, "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)

class CommentUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.select_related('author', 'task')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        return super().update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        return super().destroy(request, *args, **kwargs)
    
class TaskAttachmentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, task_id):
        attachments = Attachment.objects.filter(task_id=task_id).select_related('uploaded_by')
        serializer = AttachmentSerializer(attachments, many=True)
        return Response({"success": True, "data": serializer.data})

    def post(self, request, task_id):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "File is required."}, status=400)

        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=404)

        attachment = Attachment.objects.create(
            task=task,
            uploaded_by=request.user,
            file=file,
            original_name=file.name,
        )
        serializer = AttachmentSerializer(attachment)
        return Response({"success": True, "data": serializer.data}, status=201)

class AttachmentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            attachment = Attachment.objects.get(pk=pk)
        except Attachment.DoesNotExist:
            return Response({"error": "Attachment not found."}, status=404)

        if attachment.uploaded_by != request.user:
            return Response({"error": "Permission denied."}, status=403)

        attachment.file.delete(save=False)
        attachment.delete()
        return Response({"success": True, "message": "Attachment deleted"})

class AttachmentDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            attachment = Attachment.objects.get(pk=pk)
        except Attachment.DoesNotExist:
            raise Http404

        response = FileResponse(attachment.file.open('rb'), as_attachment=True, filename=attachment.original_name)
        return response
    
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = now().date()
        week_start = today - timedelta(days=today.weekday())

        total_tasks = Task.objects.count()
        todo = Task.objects.filter(status='todo').count()
        inprogress = Task.objects.filter(status='inprogress').count()
        done = Task.objects.filter(status='done').count()
        overdue = Task.objects.filter(due_date__lt=today).exclude(status='done').count()
        tasks_this_week = Task.objects.filter(created_at__date__gte=week_start).count()
        completed_this_week = Task.objects.filter(status='done', updated_at__date__gte=week_start).count()
        total_users = CustomUser.objects.count()

        return Response({
            "success": True,
            "data": {
                "totalTasks": total_tasks,
                "todoTasks": todo,
                "inProgressTasks": inprogress,
                "doneTasks": done,
                "overdueTasks": overdue,
                "totalUsers": total_users,
                "tasksThisWeek": tasks_this_week,
                "completedThisWeek": completed_this_week,
            }
        })


class DashboardActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = ActivityLog.objects.select_related('user', 'task').order_by('-created_at')[:20]
        serializer = ActivityLogSerializer(logs, many=True)
        return Response({"success": True, "data": serializer.data})


class TaskAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = Task.objects.values('status').annotate(count=Count('id'))
        result = {item['status']: item['count'] for item in data}
        return Response({
            "success": True,
            "data": {
                "todo": result.get("todo", 0),
                "inprogress": result.get("inprogress", 0),
                "done": result.get("done", 0)
            }
        })
    

class TaskSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '')
        status = request.GET.get('status')
        assignee = request.GET.get('assignee')
        label_ids = request.GET.get('labels', '').split(',') if request.GET.get('labels') else []

        tasks = Task.objects.select_related('assignee').prefetch_related('labels').all()

        if query:
            tasks = tasks.filter(Q(title__icontains=query) | Q(description__icontains=query))
        if status:
            tasks = tasks.filter(status=status)
        if assignee:
            tasks = tasks.filter(assignee__id=assignee)
        if label_ids:
            tasks = tasks.filter(labels__id__in=label_ids).distinct()

        serializer = TaskSerializer(tasks, many=True)
        return Response({
            "success": True,
            "data": {
                "tasks": serializer.data,
                "totalResults": tasks.count(),
                "searchQuery": query,
                "filters": {
                    "status": [status] if status else [],
                    "labels": label_ids if label_ids else [],
                    "assignee": assignee
                }
            }
        })


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '')
        users = CustomUser.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        )
        serializer = UserSerializer(users, many=True)
        return Response({
            "success": True,
            "data": {
                "users": serializer.data,
                "totalResults": users.count(),
                "searchQuery": query
            }
        })


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '')
        task_qs = Task.objects.filter(Q(title__icontains=query) | Q(description__icontains=query))
        user_qs = CustomUser.objects.filter(Q(username__icontains=query) | Q(email__icontains=query))

        tasks = TaskSerializer(task_qs, many=True).data
        users = UserSerializer(user_qs, many=True).data

        return Response({
            "success": True,
            "data": {
                "query": query,
                "tasks": tasks,
                "users": users,
                "totalTaskResults": len(tasks),
                "totalUserResults": len(users)
            }
        })