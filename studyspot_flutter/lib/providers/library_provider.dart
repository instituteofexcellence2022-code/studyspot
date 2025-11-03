import 'package:flutter/foundation.dart';

class Library {
  final String id;
  final String name;
  final String location;
  final String imageUrl;
  final int totalSeats;
  final int availableSeats;
  final double rating;
  final List<String> amenities;
  final bool isOpen;

  Library({
    required this.id,
    required this.name,
    required this.location,
    required this.imageUrl,
    required this.totalSeats,
    required this.availableSeats,
    required this.rating,
    required this.amenities,
    required this.isOpen,
  });
}

class LibraryProvider extends ChangeNotifier {
  List<Library> _libraries = [];
  bool _isLoading = false;
  String? _error;

  List<Library> get libraries => _libraries;
  bool get isLoading => _isLoading;
  String? get error => _error;

  LibraryProvider() {
    _loadLibraries();
  }

  Future<void> _loadLibraries() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));

      // Mock data
      _libraries = [
        Library(
          id: '1',
          name: 'Central Library',
          location: 'Downtown Campus',
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
          totalSeats: 150,
          availableSeats: 45,
          rating: 4.8,
          amenities: ['WiFi', 'AC', 'Power Outlets', 'Quiet Zone'],
          isOpen: true,
        ),
        Library(
          id: '2',
          name: 'Science Library',
          location: 'Science Block',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          totalSeats: 80,
          availableSeats: 12,
          rating: 4.6,
          amenities: ['WiFi', 'AC', 'Computers', 'Group Study'],
          isOpen: true,
        ),
        Library(
          id: '3',
          name: 'Digital Library',
          location: 'IT Building',
          imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400',
          totalSeats: 60,
          availableSeats: 8,
          rating: 4.9,
          amenities: ['WiFi', 'AC', 'Computers', 'Printing'],
          isOpen: false,
        ),
        Library(
          id: '4',
          name: 'Quiet Study Hall',
          location: 'Main Building',
          imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
          totalSeats: 100,
          availableSeats: 25,
          rating: 4.7,
          amenities: ['WiFi', 'AC', 'Quiet Zone', 'Individual Desks'],
          isOpen: true,
        ),
      ];
    } catch (e) {
      _error = 'Failed to load libraries: $e';
      if (kDebugMode) {
        print('Error loading libraries: $e');
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  Library? getLibraryById(String id) {
    try {
      return _libraries.firstWhere((library) => library.id == id);
    } catch (e) {
      return null;
    }
  }

  List<Library> getOpenLibraries() {
    return _libraries.where((library) => library.isOpen).toList();
  }

  List<Library> searchLibraries(String query) {
    if (query.isEmpty) return _libraries;
    
    return _libraries.where((library) {
      return library.name.toLowerCase().contains(query.toLowerCase()) ||
             library.location.toLowerCase().contains(query.toLowerCase());
    }).toList();
  }

  Future<void> refreshLibraries() async {
    await _loadLibraries();
  }
}












