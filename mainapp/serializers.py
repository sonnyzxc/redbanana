from rest_framework import serializers
from .models import Employees

class EmployeesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employees
        fields = ('pk', 'employee_name', 'online_time', 'praises')
