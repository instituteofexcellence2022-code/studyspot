import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../providers/auth_provider.dart';
import '../../providers/library_provider.dart';
import '../library/library_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<LibraryProvider>(context, listen: false).refreshLibraries();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('StudySpot'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).logout();
              Navigator.of(context).pushReplacementNamed('/login');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Welcome Section
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).primaryColor,
                  Theme.of(context).primaryColor.withOpacity(0.8),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      return Text(
                        'Welcome back, ${authProvider.userName ?? 'User'}!',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      );
                    },
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 200.ms,
                      )
                      .slideX(
                        begin: -0.3,
                        duration: 600.ms,
                        delay: 200.ms,
                      ),
                  
                  const SizedBox(height: 8),
                  
                  const Text(
                    'Find your perfect study spot',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 400.ms,
                      )
                      .slideX(
                        begin: -0.3,
                        duration: 600.ms,
                        delay: 400.ms,
                      ),
                  
                  const SizedBox(height: 20),
                  
                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Search libraries...',
                        hintStyle: TextStyle(color: Colors.white60),
                        prefixIcon: Icon(Icons.search, color: Colors.white70),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      onChanged: (value) {
                        setState(() {});
                      },
                    ),
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 600.ms,
                      )
                      .slideY(
                        begin: 0.3,
                        duration: 600.ms,
                        delay: 600.ms,
                      ),
                ],
              ),
            ),
          ),

          // Libraries List
          Expanded(
            child: Consumer<LibraryProvider>(
              builder: (context, libraryProvider, child) {
                if (libraryProvider.isLoading) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (libraryProvider.error != null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          libraryProvider.error!,
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.red,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            libraryProvider.refreshLibraries();
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                List<Library> libraries = libraryProvider.libraries;
                
                // Filter libraries based on search
                if (_searchController.text.isNotEmpty) {
                  libraries = libraryProvider.searchLibraries(_searchController.text);
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: libraries.length,
                  itemBuilder: (context, index) {
                    final library = libraries[index];
                    return _buildLibraryCard(library, index);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLibraryCard(Library library, int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => LibraryDetailScreen(library: library),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Library Image and Status
              Row(
                children: [
                  // Library Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: library.imageUrl,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.library_books,
                          color: Colors.grey,
                          size: 40,
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.library_books,
                          color: Colors.grey,
                          size: 40,
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: 16),
                  
                  // Library Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          library.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          library.location,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              Icons.star,
                              size: 16,
                              color: Colors.amber[600],
                            ),
                            const SizedBox(width: 4),
                            Text(
                              library.rating.toString(),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: library.isOpen 
                                    ? Colors.green[100] 
                                    : Colors.red[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                library.isOpen ? 'Open' : 'Closed',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: library.isOpen 
                                      ? Colors.green[800] 
                                      : Colors.red[800],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Availability
              Row(
                children: [
                  Icon(
                    Icons.chair,
                    size: 16,
                    color: Colors.blue[600],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${library.availableSeats} of ${library.totalSeats} seats available',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Amenities
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: library.amenities.take(3).map((amenity) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.blue[200]!,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      amenity,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(
          duration: 600.ms,
          delay: (index * 100).ms,
        )
        .slideY(
          begin: 0.3,
          duration: 600.ms,
          delay: (index * 100).ms,
        );
  }
}












