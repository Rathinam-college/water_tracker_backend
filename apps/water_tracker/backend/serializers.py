from rest_framework import serializers
from .models import (
    User, MasterLocation, MasterSource, MasterInternalVehicle,
    RateHistoryInternalVehicle, RateHistoryVendor, RateHistoryPipeline, WaterEntry,
    YieldLocation, YieldEntry, ConsumptionLocation, ConsumptionEntry,
    ConsumptionCategory, GeneralWaterRate, CategoryStudentCount,
    ProcurementEntry, BudgetApproved, PasswordResetRequest
)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'role', 'is_active', 'last_login',
            'can_access_operations', 'can_access_master_data', 
            'can_access_reports', 'can_manage_users'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class MasterLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterLocation
        fields = '__all__'
        ordering = ['sort_order', 'location_name']

class MasterSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterSource
        fields = '__all__'

class MasterInternalVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterInternalVehicle
        fields = '__all__'


class RateHistoryInternalVehicleSerializer(serializers.ModelSerializer):
    loading_location_name = serializers.CharField(source='loading_location.location_name', read_only=True)
    
    class Meta:
        model = RateHistoryInternalVehicle
        fields = '__all__'

class RateHistoryVendorSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source='source.source_name', read_only=True)
    
    class Meta:
        model = RateHistoryVendor
        fields = '__all__'

class RateHistoryPipelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = RateHistoryPipeline
        fields = '__all__'

class WaterEntrySerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source='source.source_name', read_only=True, allow_null=True)
    loading_location_name = serializers.CharField(source='loading_location.location_name', read_only=True, allow_null=True)
    unloading_location_name = serializers.CharField(source='unloading_location.location_name', read_only=True, allow_null=True)
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = WaterEntry
        fields = '__all__'

    def to_internal_value(self, data):
        # The frontend React form state contains empty strings ('') for unselected
        # or empty fields, which causes DRF's integer/decimal/FK validators to fail.
        # We clean these empty strings to None before validation.
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)

        nullable_fields = [
            'source', 'loading_location', 'unloading_location', 'vehicle',
            'load_count', 'meter_reading_current', 'meter_reading_previous',
            'manual_capacity_liters', 'snapshot_cost_per_liter',
            'snapshot_cost_per_kl', 'snapshot_paise_per_liter'
        ]
        for field in nullable_fields:
            if field in data and data[field] == '':
                data[field] = None

        return super().to_internal_value(data)


class YieldLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = YieldLocation
        fields = '__all__'
        ordering = ['sort_order', 'location_name']


class YieldEntrySerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.location_name', read_only=True)
    yield_type = serializers.CharField(source='location.yield_type', read_only=True)
    is_manual_yield = serializers.BooleanField(source='location.is_manual_yield', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)


    class Meta:
        model = YieldEntry
        fields = '__all__'


class ConsumptionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumptionCategory
        fields = "__all__"


class ConsumptionLocationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = ConsumptionLocation
        fields = "__all__"
        ordering = ['sort_order', 'location_name']


class ConsumptionEntrySerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(
        source="location.location_name", read_only=True
    )
    consumption_type = serializers.CharField(
        source="location.consumption_type", read_only=True
    )
    category_name = serializers.CharField(
        source="location.category.name", read_only=True, allow_null=True
    )
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True, allow_null=True
    )
    is_manual_consumption = serializers.BooleanField(
        source="location.is_manual_consumption", read_only=True
    )

    class Meta:
        model = ConsumptionEntry
        fields = "__all__"


class GeneralWaterRateSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = GeneralWaterRate
        fields = "__all__"


class CategoryStudentCountSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    entered_by_username = serializers.CharField(source='entered_by.username', read_only=True, allow_null=True)

    class Meta:
        model = CategoryStudentCount
        fields = "__all__"


class ProcurementEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementEntry
        fields = '__all__'


class BudgetApprovedSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetApproved
        fields = '__all__'


class PasswordResetRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True, allow_null=True)

    class Meta:
        model = PasswordResetRequest
        fields = '__all__'
