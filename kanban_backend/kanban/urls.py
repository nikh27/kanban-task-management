from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/auth/register', RegisterView.as_view()),
    path('api/auth/login', LoginView.as_view()),
    path('api/auth/logout', LogoutView.as_view()),
    path('api/auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me', MeView.as_view()),

    path('api/users', UserListView.as_view()),
    path('api/users/<int:pk>', UserDetailView.as_view()),

    path('api/tasks', TaskListCreateView.as_view()),
    path('api/tasks/<int:pk>', TaskDetailView.as_view()),
    path('api/tasks/<int:pk>/status', TaskStatusUpdateView.as_view()),
    path('api/tasks/<int:pk>/assignee', TaskAssigneeUpdateView.as_view()),

    path('api/labels', LabelListCreateView.as_view()),
    path('api/labels/<int:pk>', LabelUpdateDeleteView.as_view()),

    path('api/tasks/<int:task_id>/comments', TaskCommentListCreateView.as_view()),
    path('api/comments/<int:pk>', CommentUpdateDeleteView.as_view()),

    path('api/tasks/<int:task_id>/attachments', TaskAttachmentListCreateView.as_view()),
    path('api/attachments/<int:pk>', AttachmentDeleteView.as_view()),
    path('api/attachments/<int:pk>/download', AttachmentDownloadView.as_view()),

    path('api/dashboard/stats', DashboardStatsView.as_view()),
    path('api/dashboard/activity', DashboardActivityView.as_view()),
    path('api/tasks/analytics', TaskAnalyticsView.as_view()),

    path('api/search/tasks', TaskSearchView.as_view()),
    path('api/search/users', UserSearchView.as_view()),
    path('api/search/global', GlobalSearchView.as_view()),
]

