// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fire_report.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FireReportImpl _$$FireReportImplFromJson(Map<String, dynamic> json) =>
    _$FireReportImpl(
      id: json['id'] as String,
      userId: json['userId'] as String,
      description: json['description'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      images:
          (json['images'] as List<dynamic>).map((e) => e as String).toList(),
      status: json['status'] as String,
      reportedAt: DateTime.parse(json['reportedAt'] as String),
      aiConfidence: json['aiConfidence'] as String?,
      aiDetected: (json['aiDetected'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      aiRiskLevel: json['aiRiskLevel'] as String?,
      verifiedAt: json['verifiedAt'] == null
          ? null
          : DateTime.parse(json['verifiedAt'] as String),
      emergency112Notified: json['emergency112Notified'] as bool?,
      satelliteMatchId: json['satelliteMatchId'] as String?,
    );

Map<String, dynamic> _$$FireReportImplToJson(_$FireReportImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'description': instance.description,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'images': instance.images,
      'status': instance.status,
      'reportedAt': instance.reportedAt.toIso8601String(),
      'aiConfidence': instance.aiConfidence,
      'aiDetected': instance.aiDetected,
      'aiRiskLevel': instance.aiRiskLevel,
      'verifiedAt': instance.verifiedAt?.toIso8601String(),
      'emergency112Notified': instance.emergency112Notified,
      'satelliteMatchId': instance.satelliteMatchId,
    };
