# Generated by Django 3.2.4 on 2021-07-02 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('checkout', '0004_order_user_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='order_number',
            field=models.CharField(editable=False, max_length=64),
        ),
        migrations.AlterField(
            model_name='order',
            name='stripe_pid',
            field=models.CharField(default='', max_length=254),
        ),
    ]
