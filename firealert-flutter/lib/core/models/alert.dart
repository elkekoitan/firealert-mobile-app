import 'package:freezed_annotation/freezed_annotation.dart';

part 'alert.freezed.dart';
part 'alert.g.dart';

@freezed
class Alert with _$Alert {
  const factory Alert({
    required String id,
    required String type,
    required String title,
    required String body,
    required Map<String, dynamic> data,
    String? userId,
    required DateTime createdAt,
  }) = _Alert;

  factory Alert.fromJson(Map<String, dynamic> json) => _$AlertFromJson(json);
}

enum AlertType {
  @JsonValue('FIRE_ALERT')
  fireAlert,
  @JsonValue('VERIFICATION')
  verification,
  @JsonValue('EMERGENCY')
  emergency,
  @JsonValue('SYSTEM')
  system,
}
