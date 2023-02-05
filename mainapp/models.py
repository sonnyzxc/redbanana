from django.db import models

# Create your models here.
class Employees(models.Model):
    employee_name = models.CharField(max_length=200)
    online_time = models.IntegerField(default=0)
    lines = models.IntegerField(default=0)
    commits = models.IntegerField(default=0)
    praises = models.IntegerField(default=0)

    def __str__(self):
        return self.employee_name