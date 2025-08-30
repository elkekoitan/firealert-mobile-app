// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'fire_report.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

FireReport _$FireReportFromJson(Map<String, dynamic> json) {
  return _FireReport.fromJson(json);
}

/// @nodoc
mixin _$FireReport {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  List<String> get images => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  DateTime get reportedAt => throw _privateConstructorUsedError;
  String? get aiConfidence => throw _privateConstructorUsedError;
  List<String>? get aiDetected => throw _privateConstructorUsedError;
  String? get aiRiskLevel => throw _privateConstructorUsedError;
  DateTime? get verifiedAt => throw _privateConstructorUsedError;
  bool? get emergency112Notified => throw _privateConstructorUsedError;
  String? get satelliteMatchId => throw _privateConstructorUsedError;

  /// Serializes this FireReport to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FireReport
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FireReportCopyWith<FireReport> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FireReportCopyWith<$Res> {
  factory $FireReportCopyWith(
          FireReport value, $Res Function(FireReport) then) =
      _$FireReportCopyWithImpl<$Res, FireReport>;
  @useResult
  $Res call(
      {String id,
      String userId,
      String description,
      double latitude,
      double longitude,
      List<String> images,
      String status,
      DateTime reportedAt,
      String? aiConfidence,
      List<String>? aiDetected,
      String? aiRiskLevel,
      DateTime? verifiedAt,
      bool? emergency112Notified,
      String? satelliteMatchId});
}

/// @nodoc
class _$FireReportCopyWithImpl<$Res, $Val extends FireReport>
    implements $FireReportCopyWith<$Res> {
  _$FireReportCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FireReport
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? description = null,
    Object? latitude = null,
    Object? longitude = null,
    Object? images = null,
    Object? status = null,
    Object? reportedAt = null,
    Object? aiConfidence = freezed,
    Object? aiDetected = freezed,
    Object? aiRiskLevel = freezed,
    Object? verifiedAt = freezed,
    Object? emergency112Notified = freezed,
    Object? satelliteMatchId = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      latitude: null == latitude
          ? _value.latitude
          : latitude // ignore: cast_nullable_to_non_nullable
              as double,
      longitude: null == longitude
          ? _value.longitude
          : longitude // ignore: cast_nullable_to_non_nullable
              as double,
      images: null == images
          ? _value.images
          : images // ignore: cast_nullable_to_non_nullable
              as List<String>,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      reportedAt: null == reportedAt
          ? _value.reportedAt
          : reportedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      aiConfidence: freezed == aiConfidence
          ? _value.aiConfidence
          : aiConfidence // ignore: cast_nullable_to_non_nullable
              as String?,
      aiDetected: freezed == aiDetected
          ? _value.aiDetected
          : aiDetected // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      aiRiskLevel: freezed == aiRiskLevel
          ? _value.aiRiskLevel
          : aiRiskLevel // ignore: cast_nullable_to_non_nullable
              as String?,
      verifiedAt: freezed == verifiedAt
          ? _value.verifiedAt
          : verifiedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      emergency112Notified: freezed == emergency112Notified
          ? _value.emergency112Notified
          : emergency112Notified // ignore: cast_nullable_to_non_nullable
              as bool?,
      satelliteMatchId: freezed == satelliteMatchId
          ? _value.satelliteMatchId
          : satelliteMatchId // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$FireReportImplCopyWith<$Res>
    implements $FireReportCopyWith<$Res> {
  factory _$$FireReportImplCopyWith(
          _$FireReportImpl value, $Res Function(_$FireReportImpl) then) =
      __$$FireReportImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String userId,
      String description,
      double latitude,
      double longitude,
      List<String> images,
      String status,
      DateTime reportedAt,
      String? aiConfidence,
      List<String>? aiDetected,
      String? aiRiskLevel,
      DateTime? verifiedAt,
      bool? emergency112Notified,
      String? satelliteMatchId});
}

/// @nodoc
class __$$FireReportImplCopyWithImpl<$Res>
    extends _$FireReportCopyWithImpl<$Res, _$FireReportImpl>
    implements _$$FireReportImplCopyWith<$Res> {
  __$$FireReportImplCopyWithImpl(
      _$FireReportImpl _value, $Res Function(_$FireReportImpl) _then)
      : super(_value, _then);

  /// Create a copy of FireReport
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? description = null,
    Object? latitude = null,
    Object? longitude = null,
    Object? images = null,
    Object? status = null,
    Object? reportedAt = null,
    Object? aiConfidence = freezed,
    Object? aiDetected = freezed,
    Object? aiRiskLevel = freezed,
    Object? verifiedAt = freezed,
    Object? emergency112Notified = freezed,
    Object? satelliteMatchId = freezed,
  }) {
    return _then(_$FireReportImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      latitude: null == latitude
          ? _value.latitude
          : latitude // ignore: cast_nullable_to_non_nullable
              as double,
      longitude: null == longitude
          ? _value.longitude
          : longitude // ignore: cast_nullable_to_non_nullable
              as double,
      images: null == images
          ? _value._images
          : images // ignore: cast_nullable_to_non_nullable
              as List<String>,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      reportedAt: null == reportedAt
          ? _value.reportedAt
          : reportedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      aiConfidence: freezed == aiConfidence
          ? _value.aiConfidence
          : aiConfidence // ignore: cast_nullable_to_non_nullable
              as String?,
      aiDetected: freezed == aiDetected
          ? _value._aiDetected
          : aiDetected // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      aiRiskLevel: freezed == aiRiskLevel
          ? _value.aiRiskLevel
          : aiRiskLevel // ignore: cast_nullable_to_non_nullable
              as String?,
      verifiedAt: freezed == verifiedAt
          ? _value.verifiedAt
          : verifiedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      emergency112Notified: freezed == emergency112Notified
          ? _value.emergency112Notified
          : emergency112Notified // ignore: cast_nullable_to_non_nullable
              as bool?,
      satelliteMatchId: freezed == satelliteMatchId
          ? _value.satelliteMatchId
          : satelliteMatchId // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$FireReportImpl implements _FireReport {
  const _$FireReportImpl(
      {required this.id,
      required this.userId,
      required this.description,
      required this.latitude,
      required this.longitude,
      required final List<String> images,
      required this.status,
      required this.reportedAt,
      this.aiConfidence,
      final List<String>? aiDetected,
      this.aiRiskLevel,
      this.verifiedAt,
      this.emergency112Notified,
      this.satelliteMatchId})
      : _images = images,
        _aiDetected = aiDetected;

  factory _$FireReportImpl.fromJson(Map<String, dynamic> json) =>
      _$$FireReportImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final String description;
  @override
  final double latitude;
  @override
  final double longitude;
  final List<String> _images;
  @override
  List<String> get images {
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_images);
  }

  @override
  final String status;
  @override
  final DateTime reportedAt;
  @override
  final String? aiConfidence;
  final List<String>? _aiDetected;
  @override
  List<String>? get aiDetected {
    final value = _aiDetected;
    if (value == null) return null;
    if (_aiDetected is EqualUnmodifiableListView) return _aiDetected;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? aiRiskLevel;
  @override
  final DateTime? verifiedAt;
  @override
  final bool? emergency112Notified;
  @override
  final String? satelliteMatchId;

  @override
  String toString() {
    return 'FireReport(id: $id, userId: $userId, description: $description, latitude: $latitude, longitude: $longitude, images: $images, status: $status, reportedAt: $reportedAt, aiConfidence: $aiConfidence, aiDetected: $aiDetected, aiRiskLevel: $aiRiskLevel, verifiedAt: $verifiedAt, emergency112Notified: $emergency112Notified, satelliteMatchId: $satelliteMatchId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FireReportImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            const DeepCollectionEquality().equals(other._images, _images) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.reportedAt, reportedAt) ||
                other.reportedAt == reportedAt) &&
            (identical(other.aiConfidence, aiConfidence) ||
                other.aiConfidence == aiConfidence) &&
            const DeepCollectionEquality()
                .equals(other._aiDetected, _aiDetected) &&
            (identical(other.aiRiskLevel, aiRiskLevel) ||
                other.aiRiskLevel == aiRiskLevel) &&
            (identical(other.verifiedAt, verifiedAt) ||
                other.verifiedAt == verifiedAt) &&
            (identical(other.emergency112Notified, emergency112Notified) ||
                other.emergency112Notified == emergency112Notified) &&
            (identical(other.satelliteMatchId, satelliteMatchId) ||
                other.satelliteMatchId == satelliteMatchId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      userId,
      description,
      latitude,
      longitude,
      const DeepCollectionEquality().hash(_images),
      status,
      reportedAt,
      aiConfidence,
      const DeepCollectionEquality().hash(_aiDetected),
      aiRiskLevel,
      verifiedAt,
      emergency112Notified,
      satelliteMatchId);

  /// Create a copy of FireReport
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FireReportImplCopyWith<_$FireReportImpl> get copyWith =>
      __$$FireReportImplCopyWithImpl<_$FireReportImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FireReportImplToJson(
      this,
    );
  }
}

abstract class _FireReport implements FireReport {
  const factory _FireReport(
      {required final String id,
      required final String userId,
      required final String description,
      required final double latitude,
      required final double longitude,
      required final List<String> images,
      required final String status,
      required final DateTime reportedAt,
      final String? aiConfidence,
      final List<String>? aiDetected,
      final String? aiRiskLevel,
      final DateTime? verifiedAt,
      final bool? emergency112Notified,
      final String? satelliteMatchId}) = _$FireReportImpl;

  factory _FireReport.fromJson(Map<String, dynamic> json) =
      _$FireReportImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  String get description;
  @override
  double get latitude;
  @override
  double get longitude;
  @override
  List<String> get images;
  @override
  String get status;
  @override
  DateTime get reportedAt;
  @override
  String? get aiConfidence;
  @override
  List<String>? get aiDetected;
  @override
  String? get aiRiskLevel;
  @override
  DateTime? get verifiedAt;
  @override
  bool? get emergency112Notified;
  @override
  String? get satelliteMatchId;

  /// Create a copy of FireReport
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FireReportImplCopyWith<_$FireReportImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
