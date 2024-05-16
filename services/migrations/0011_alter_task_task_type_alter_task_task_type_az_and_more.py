# Generated by Django 5.0.6 on 2024-05-15 21:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0010_alter_task_task_type_alter_task_task_type_az_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='task_type',
            field=models.CharField(choices=[('en', [('connection', 'Connection'), ('problem', 'Problem')]), ('az', [('connection', 'Qoşulma'), ('problem', 'Problem')])], max_length=100),
        ),
        migrations.AlterField(
            model_name='task',
            name='task_type_az',
            field=models.CharField(choices=[('en', [('connection', 'Connection'), ('problem', 'Problem')]), ('az', [('connection', 'Qoşulma'), ('problem', 'Problem')])], max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='task',
            name='task_type_en',
            field=models.CharField(choices=[('en', [('connection', 'Connection'), ('problem', 'Problem')]), ('az', [('connection', 'Qoşulma'), ('problem', 'Problem')])], max_length=100, null=True),
        ),
    ]