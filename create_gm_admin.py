from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(username='gm_admin').exists():
        User.objects.create_superuser(
            username='gm_admin',
            password='gm123',
            email='gm@example.com',
            role='Admin',
            can_access_operations=True,
            can_access_master_data=True,
            can_access_reports=True,
            can_manage_users=True
        )
        print("SUCCESS: User gm_admin created.")
    else:
        u = User.objects.get(username='gm_admin')
        u.set_password('gm123')
        u.save()
        print("SUCCESS: User gm_admin password updated.")
except Exception as e:
    print(f"ERROR: {str(e)}")
