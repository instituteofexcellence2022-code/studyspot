import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Models
class User {
  final String id;
  final String email;
  final String name;
  final String? profileImage;
  final String? phoneNumber;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.profileImage,
    this.phoneNumber,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      profileImage: json['profile_image'],
      phoneNumber: json['phone_number'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'profile_image': profileImage,
      'phone_number': phoneNumber,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class Library {
  final String id;
  final String name;
  final String description;
  final String address;
  final double latitude;
  final double longitude;
  final String? imageUrl;
  final double rating;
  final int totalSeats;
  final int availableSeats;
  final double hourlyRate;
  final List<String> amenities;
  final bool isOpen;
  final String ownerId;

  Library({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.imageUrl,
    required this.rating,
    required this.totalSeats,
    required this.availableSeats,
    required this.hourlyRate,
    required this.amenities,
    required this.isOpen,
    required this.ownerId,
  });

  factory Library.fromJson(Map<String, dynamic> json) {
    return Library(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      address: json['address'],
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      imageUrl: json['image_url'],
      rating: json['rating'].toDouble(),
      totalSeats: json['total_seats'],
      availableSeats: json['available_seats'],
      hourlyRate: json['hourly_rate'].toDouble(),
      amenities: List<String>.from(json['amenities'] ?? []),
      isOpen: json['is_open'] ?? true,
      ownerId: json['owner_id'],
    );
  }
}

class Booking {
  final String id;
  final String userId;
  final String libraryId;
  final DateTime startTime;
  final DateTime endTime;
  final double totalAmount;
  final String status;
  final DateTime createdAt;
  final Library? library;

  Booking({
    required this.id,
    required this.userId,
    required this.libraryId,
    required this.startTime,
    required this.endTime,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    this.library,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      userId: json['user_id'],
      libraryId: json['library_id'],
      startTime: DateTime.parse(json['start_time']),
      endTime: DateTime.parse(json['end_time']),
      totalAmount: json['total_amount'].toDouble(),
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      library: json['library'] != null ? Library.fromJson(json['library']) : null,
    );
  }
}

// API Service
class ApiService {
  final Dio _dio;
  final String baseUrl;

  ApiService({required this.baseUrl}) : _dio = Dio() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    
    // Add interceptors for logging and auth
    _dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
  }

  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? data}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  Future<Map<String, dynamic>> put(String path, {Map<String, dynamic>? data}) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  Future<Map<String, dynamic>> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }
}

// Providers
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(baseUrl: 'https://your-api-url.com/api');
});

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be initialized');
});

// Auth Provider
class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  AuthNotifier(this._apiService, this._prefs) : super(const AsyncValue.data(null));

  final ApiService _apiService;
  final SharedPreferences _prefs;

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _apiService.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response['success'] == true) {
        final user = User.fromJson(response['user']);
        final token = response['token'];
        
        await _prefs.setString('auth_token', token);
        await _prefs.setString('user_data', user.toJson().toString());
        
        state = AsyncValue.data(user);
      } else {
        state = AsyncValue.error(response['message'] ?? 'Login failed', StackTrace.current);
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _apiService.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
      });

      if (response['success'] == true) {
        final user = User.fromJson(response['user']);
        final token = response['token'];
        
        await _prefs.setString('auth_token', token);
        await _prefs.setString('user_data', user.toJson().toString());
        
        state = AsyncValue.data(user);
      } else {
        state = AsyncValue.error(response['message'] ?? 'Registration failed', StackTrace.current);
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> logout() async {
    await _prefs.remove('auth_token');
    await _prefs.remove('user_data');
    state = const AsyncValue.data(null);
  }

  Future<void> checkAuthStatus() async {
    final token = _prefs.getString('auth_token');
    final userData = _prefs.getString('user_data');
    
    if (token != null && userData != null) {
      try {
        // Verify token with server
        final response = await _apiService.get('/auth/verify');
        if (response['success'] == true) {
          final user = User.fromJson(response['user']);
          state = AsyncValue.data(user);
        } else {
          await logout();
        }
      } catch (e) {
        await logout();
      }
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthNotifier(apiService, prefs);
});

// Library Provider
class LibraryNotifier extends StateNotifier<AsyncValue<List<Library>>> {
  LibraryNotifier(this._apiService) : super(const AsyncValue.loading());

  final ApiService _apiService;

  Future<void> fetchLibraries() async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _apiService.get('/libraries');
      
      if (response['success'] == true) {
        final libraries = (response['libraries'] as List)
            .map((json) => Library.fromJson(json))
            .toList();
        state = AsyncValue.data(libraries);
      } else {
        state = AsyncValue.error(response['message'] ?? 'Failed to fetch libraries', StackTrace.current);
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> searchLibraries(String query) async {
    try {
      final response = await _apiService.get('/libraries/search', queryParameters: {
        'q': query,
      });
      
      if (response['success'] == true) {
        final libraries = (response['libraries'] as List)
            .map((json) => Library.fromJson(json))
            .toList();
        state = AsyncValue.data(libraries);
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final libraryProvider = StateNotifierProvider<LibraryNotifier, AsyncValue<List<Library>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return LibraryNotifier(apiService);
});

// Booking Provider
class BookingNotifier extends StateNotifier<AsyncValue<List<Booking>>> {
  BookingNotifier(this._apiService) : super(const AsyncValue.loading());

  final ApiService _apiService;

  Future<void> fetchBookings() async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _apiService.get('/bookings');
      
      if (response['success'] == true) {
        final bookings = (response['bookings'] as List)
            .map((json) => Booking.fromJson(json))
            .toList();
        state = AsyncValue.data(bookings);
      } else {
        state = AsyncValue.error(response['message'] ?? 'Failed to fetch bookings', StackTrace.current);
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> createBooking(String libraryId, DateTime startTime, DateTime endTime) async {
    try {
      final response = await _apiService.post('/bookings', data: {
        'library_id': libraryId,
        'start_time': startTime.toIso8601String(),
        'end_time': endTime.toIso8601String(),
      });
      
      if (response['success'] == true) {
        // Refresh bookings
        await fetchBookings();
      } else {
        throw Exception(response['message'] ?? 'Failed to create booking');
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final bookingProvider = StateNotifierProvider<BookingNotifier, AsyncValue<List<Booking>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return BookingNotifier(apiService);
});

// Payment Provider
class PaymentNotifier extends StateNotifier<AsyncValue<String?>> {
  PaymentNotifier(this._apiService) : super(const AsyncValue.data(null));

  final ApiService _apiService;

  Future<void> processPayment(String bookingId, double amount) async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _apiService.post('/payments', data: {
        'booking_id': bookingId,
        'amount': amount,
      });
      
      if (response['success'] == true) {
        state = AsyncValue.data(response['payment_id']);
      } else {
        state = AsyncValue.error(response['message'] ?? 'Payment failed', StackTrace.current);
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final paymentProvider = StateNotifierProvider<PaymentNotifier, AsyncValue<String?>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return PaymentNotifier(apiService);
});

// Notification Provider
class NotificationNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  NotificationNotifier() : super(const AsyncValue.data([]));

  Future<void> fetchNotifications() async {
    state = const AsyncValue.loading();
    
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));
      
      final notifications = [
        {
          'id': '1',
          'title': 'Booking Confirmed',
          'message': 'Your booking at Central Library has been confirmed',
          'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
          'isRead': false,
        },
        {
          'id': '2',
          'title': 'Payment Successful',
          'message': 'Payment of ₹150 has been processed successfully',
          'timestamp': DateTime.now().subtract(const Duration(hours: 5)),
          'isRead': true,
        },
      ];
      
      state = AsyncValue.data(notifications);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> markAsRead(String notificationId) async {
    state.whenData((notifications) {
      final updatedNotifications = notifications.map((notification) {
        if (notification['id'] == notificationId) {
          return {...notification, 'isRead': true};
        }
        return notification;
      }).toList();
      
      state = AsyncValue.data(updatedNotifications);
    });
  }
}

final notificationProvider = StateNotifierProvider<NotificationNotifier, AsyncValue<List<Map<String, dynamic>>>>((ref) {
  return NotificationNotifier();
});











