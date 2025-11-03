import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _userEmail;
  String? _userName;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get userEmail => _userEmail;
  String? get userName => _userName;

  AuthProvider() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _isAuthenticated = prefs.getBool('isAuthenticated') ?? false;
      _userEmail = prefs.getString('userEmail');
      _userName = prefs.getString('userName');
    } catch (e) {
      if (kDebugMode) {
        print('Error checking auth status: $e');
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      // Mock authentication - accept any email/password
      if (email.isNotEmpty && password.isNotEmpty) {
        _isAuthenticated = true;
        _userEmail = email;
        _userName = email.split('@')[0];

        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('isAuthenticated', true);
        await prefs.setString('userEmail', email);
        await prefs.setString('userName', _userName!);

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('isAuthenticated');
      await prefs.remove('userEmail');
      await prefs.remove('userName');

      _isAuthenticated = false;
      _userEmail = null;
      _userName = null;
    } catch (e) {
      if (kDebugMode) {
        print('Error during logout: $e');
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateProfile(String name) async {
    try {
      _userName = name;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userName', name);
      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('Error updating profile: $e');
      }
    }
  }
}












