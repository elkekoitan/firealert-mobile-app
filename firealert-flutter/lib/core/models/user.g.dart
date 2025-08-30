// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      reliabilityScore: (json['reliabilityScore'] as num).toInt(),
      totalReports: (json['totalReports'] as num).toInt(),
      verifiedReports: (json['verifiedReports'] as num).toInt(),
      isVerified: json['isVerified'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'name': instance.name,
      'phone': instance.phone,
      'avatarUrl': instance.avatarUrl,
      'reliabilityScore': instance.reliabilityScore,
      'totalReports': instance.totalReports,
      'verifiedReports': instance.verifiedReports,
      'isVerified': instance.isVerified,
      'createdAt': instance.createdAt.toIso8601String(),
    };
