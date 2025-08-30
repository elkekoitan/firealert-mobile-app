import 'package:freezed_annotation/freezed_annotation.dart';

part 'fire_report.freezed.dart';
part 'fire_report.g.dart';

@freezed
class FireReport with _$FireReport {
  const factory FireReport({
    required String id,
    required String userId,
    required String description,
    required double latitude,
    required double longitude,
    required List<String> images,
    required String status,
    required DateTime reportedAt,
    String? aiConfidence,
    List<String>? aiDetected,
    String? aiRiskLevel,
    DateTime? verifiedAt,
    bool? emergency112Notified,
    String? satelliteMatchId,
  }) = _FireReport;

  factory FireReport.fromJson(Map<String, dynamic> json) =>
      _$FireReportFromJson(json);
}

enum ReportStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('VERIFIED')
  verified,
  @JsonValue('FALSE_ALARM')
  falseAlarm,
  @JsonValue('RESOLVED')
  resolved,
}

enum RiskLevel {
  @JsonValue('LOW')
  low,
  @JsonValue('MEDIUM')
  medium,
  @JsonValue('HIGH')
  high,
  @JsonValue('CRITICAL')
  critical,
}
