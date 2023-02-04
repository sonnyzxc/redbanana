from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.http import HttpResponse, JsonResponse

from .models import Employees

from .serializers import EmployeesSerializer

def index(request):
    return HttpResponse("..")

@api_view(['GET', 'POST'])
def employees_list(request):
    if request.method == 'GET':
        data = Employees.objects.all()

        serializer = EmployeesSerializer(data, context={'request': request}, many=True)
        
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = EmployeesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def employees_detail(request, pk):
    try:
        employee = Employees.objects.get(pk=pk)
    except Employees.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = EmployeesSerializer(employee, data=request.data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def getStatus(request):
    emp = Employees.objects.get()
    print(list(emp.values()))
    return JsonResponse({"status":list(emp.values())})