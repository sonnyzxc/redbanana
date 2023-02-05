from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('lobby/', views.lobby, name='lobby'),
    path('getStatus/', views.getStatus, name='getStatus'),
]

# q: code does not recognise getStatus, how to fix?
# a: 