import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../core/services/supabase_service.dart';
import '../../../core/models/user.dart';

// Events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [email, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String name;

  const AuthRegisterRequested({
    required this.email,
    required this.password,
    required this.name,
  });

  @override
  List<Object?> get props => [email, password, name];
}

class AuthLogoutRequested extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final User user;

  const AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

class AuthUnauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String message;

  const AuthFailure(this.message);

  @override
  List<Object?> get props => [message];
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final SupabaseService supabaseService;

  AuthBloc({required this.supabaseService}) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final user = supabaseService.currentUser;
      if (user != null) {
        // Fetch user profile from Supabase
        final response = await supabaseService.client
            .from('profiles')
            .select()
            .eq('user_id', user.id)
            .single();
        
        final userProfile = User.fromJson(response);
        emit(AuthAuthenticated(userProfile));
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final response = await supabaseService.signIn(
        email: event.email,
        password: event.password,
      );
      
      if (response.user != null) {
        // Fetch user profile
        final profileResponse = await supabaseService.client
            .from('profiles')
            .select()
            .eq('user_id', response.user!.id)
            .single();
        
        final userProfile = User.fromJson(profileResponse);
        emit(AuthAuthenticated(userProfile));
      } else {
        emit(const AuthFailure('Login failed'));
      }
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onAuthRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final response = await supabaseService.signUp(
        email: event.email,
        password: event.password,
        data: {'name': event.name},
      );
      
      if (response.user != null) {
        // Create user profile
        await supabaseService.client.from('profiles').insert({
          'user_id': response.user!.id,
          'name': event.name,
          'email': event.email,
          'reliability_score': 50,
          'total_reports': 0,
          'verified_reports': 0,
          'is_verified': false,
        });
        
        final userProfile = User(
          id: response.user!.id,
          email: event.email,
          name: event.name,
          reliabilityScore: 50,
          totalReports: 0,
          verifiedReports: 0,
          isVerified: false,
          createdAt: DateTime.now(),
        );
        
        emit(AuthAuthenticated(userProfile));
      } else {
        emit(const AuthFailure('Registration failed'));
      }
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      await supabaseService.signOut();
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }
}
