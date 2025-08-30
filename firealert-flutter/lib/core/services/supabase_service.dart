import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;
  
  // Auth methods
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    Map<String, dynamic>? data,
  }) async {
    return await client.auth.signUp(
      email: email,
      password: password,
      data: data,
    );
  }

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<void> signOut() async {
    await client.auth.signOut();
  }

  User? get currentUser => client.auth.currentUser;

  Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;

  // Fire reports methods
  Future<List<Map<String, dynamic>>> getFireReports({
    List<double>? bbox,
    int? hours,
    String? riskLevel,
  }) async {
    var query = client
        .from('fire_reports')
        .select('*, profiles(*)')
        .order('reported_at', ascending: false);

    if (bbox != null && bbox.length == 4) {
      // PostGIS spatial query for bounding box
      query = query.filter(
        'location',
        'st_within',
        'SRID=4326;POLYGON((${bbox[0]} ${bbox[1]}, ${bbox[2]} ${bbox[1]}, ${bbox[2]} ${bbox[3]}, ${bbox[0]} ${bbox[3]}, ${bbox[0]} ${bbox[1]}))',
      );
    }

    if (hours != null) {
      final hoursAgo = DateTime.now().subtract(Duration(hours: hours));
      query = query.gte('reported_at', hoursAgo.toIso8601String());
    }

    if (riskLevel != null) {
      query = query.eq('ai_risk_level', riskLevel.toUpperCase());
    }

    final response = await query;
    return List<Map<String, dynamic>>.from(response);
  }

  Future<Map<String, dynamic>> createFireReport({
    required String description,
    required double latitude,
    required double longitude,
    List<String>? imageUrls,
  }) async {
    final user = currentUser;
    if (user == null) throw Exception('User not authenticated');

    final response = await client.from('fire_reports').insert({
      'user_id': user.id,
      'description': description,
      'location': 'POINT($longitude $latitude)',
      'images': imageUrls ?? [],
      'status': 'PENDING',
      'reported_at': DateTime.now().toIso8601String(),
    }).select().single();

    return response;
  }

  // Satellite hotspots methods
  Future<List<Map<String, dynamic>>> getSatelliteHotspots({
    List<double>? bbox,
    int? hours,
  }) async {
    var query = client
        .from('satellite_hotspots')
        .select('*')
        .order('acquired_at', ascending: false);

    if (bbox != null && bbox.length == 4) {
      query = query.filter(
        'location',
        'st_within',
        'SRID=4326;POLYGON((${bbox[0]} ${bbox[1]}, ${bbox[2]} ${bbox[1]}, ${bbox[2]} ${bbox[3]}, ${bbox[0]} ${bbox[3]}, ${bbox[0]} ${bbox[1]}))',
      );
    }

    if (hours != null) {
      final hoursAgo = DateTime.now().subtract(Duration(hours: hours));
      query = query.gte('acquired_at', hoursAgo.toIso8601String());
    }

    final response = await query;
    return List<Map<String, dynamic>>.from(response);
  }

  // Alerts methods
  Future<List<Map<String, dynamic>>> getAlerts() async {
    final user = currentUser;
    if (user == null) throw Exception('User not authenticated');

    final response = await client
        .from('alerts')
        .select('*')
        .or('user_id.eq.${user.id},user_id.is.null')
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(response);
  }

  // Push token registration
  Future<void> registerPushToken({
    required String expoToken,
    required String platform,
  }) async {
    final user = currentUser;
    if (user == null) throw Exception('User not authenticated');

    await client.from('push_tokens').upsert({
      'user_id': user.id,
      'expo_token': expoToken,
      'platform': platform,
    });
  }

  // Real-time subscriptions
  RealtimeChannel subscribeToFireReports() {
    return client
        .channel('fire_reports')
        .on(
          RealtimeListenTypes.postgresChanges,
          ChannelFilter(
            event: '*',
            schema: 'public',
            table: 'fire_reports',
          ),
          (payload, [ref]) {
            // Handle real-time updates
          },
        )
        .subscribe();
  }

  RealtimeChannel subscribeToAlerts() {
    return client
        .channel('alerts')
        .on(
          RealtimeListenTypes.postgresChanges,
          ChannelFilter(
            event: '*',
            schema: 'public',
            table: 'alerts',
          ),
          (payload, [ref]) {
            // Handle real-time updates
          },
        )
        .subscribe();
  }
}
