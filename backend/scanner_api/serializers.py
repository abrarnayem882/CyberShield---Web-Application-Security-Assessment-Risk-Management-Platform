from rest_framework import serializers
from .models import ScanRecord, ScanAuditLog, AssessmentRequest, UserProfile, Organization

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'domain', 'industry', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'name', 'role', 'organization_name', 'is_active', 'created_at']

class ScanInputSerializer(serializers.Serializer):
    url = serializers.CharField(max_length=2048, required=True)
    user_name = serializers.CharField(max_length=255, required=False, default='MD. Abu Nayem')
    role = serializers.CharField(max_length=50, required=False, default='customer')

class ScanRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanRecord
        fields = '__all__'

class ScanAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanAuditLog
        fields = '__all__'

class AssessmentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentRequest
        fields = '__all__'

