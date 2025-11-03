import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../providers/library_provider.dart';

class LibraryDetailScreen extends StatelessWidget {
  final Library library;

  const LibraryDetailScreen({
    super.key,
    required this.library,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: CachedNetworkImage(
                imageUrl: library.imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey[300],
                  child: const Center(
                    child: Icon(
                      Icons.library_books,
                      size: 64,
                      color: Colors.grey,
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey[300],
                  child: const Center(
                    child: Icon(
                      Icons.library_books,
                      size: 64,
                      color: Colors.grey,
                    ),
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {
                  // Share functionality
                },
              ),
            ],
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Library Name and Status
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          library.name,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: library.isOpen 
                              ? Colors.green[100] 
                              : Colors.red[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          library.isOpen ? 'Open' : 'Closed',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: library.isOpen 
                                ? Colors.green[800] 
                                : Colors.red[800],
                          ),
                        ),
                      ),
                    ],
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 200.ms,
                      )
                      .slideY(
                        begin: 0.3,
                        duration: 600.ms,
                        delay: 200.ms,
                      ),

                  const SizedBox(height: 8),

                  // Location
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 20,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 8),
                      Text(
                        library.location,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
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

                  const SizedBox(height: 16),

                  // Rating
                  Row(
                    children: [
                      Icon(
                        Icons.star,
                        size: 20,
                        color: Colors.amber[600],
                      ),
                      const SizedBox(width: 8),
                      Text(
                        library.rating.toString(),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${library.totalSeats} reviews)',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 600.ms,
                      )
                      .slideX(
                        begin: -0.3,
                        duration: 600.ms,
                        delay: 600.ms,
                      ),

                  const SizedBox(height: 24),

                  // Availability Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: Colors.blue[200]!,
                        width: 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Available Seats',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[700],
                                  ),
                                ),
                                Text(
                                  '${library.availableSeats}',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Total Seats',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[700],
                                  ),
                                ),
                                Text(
                                  '${library.totalSeats}',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        LinearProgressIndicator(
                          value: library.availableSeats / library.totalSeats,
                          backgroundColor: Colors.blue[200],
                          valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                        ),
                      ],
                    ),
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 800.ms,
                      )
                      .slideY(
                        begin: 0.3,
                        duration: 600.ms,
                        delay: 800.ms,
                      ),

                  const SizedBox(height: 24),

                  // Amenities
                  const Text(
                    'Amenities',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 1000.ms,
                      ),

                  const SizedBox(height: 12),

                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: library.amenities.map((amenity) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.green[200]!,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _getAmenityIcon(amenity),
                              size: 16,
                              color: Colors.green[700],
                            ),
                            const SizedBox(width: 8),
                            Text(
                              amenity,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.green[700],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 1200.ms,
                      )
                      .slideY(
                        begin: 0.3,
                        duration: 600.ms,
                        delay: 1200.ms,
                      ),

                  const SizedBox(height: 32),

                  // Book Seat Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: library.isOpen && library.availableSeats > 0
                          ? () {
                              // Book seat functionality
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Seat booking feature coming soon!'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: library.isOpen && library.availableSeats > 0
                            ? Theme.of(context).primaryColor
                            : Colors.grey,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        library.isOpen && library.availableSeats > 0
                            ? 'Book a Seat'
                            : 'Currently Unavailable',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(
                        duration: 600.ms,
                        delay: 1400.ms,
                      )
                      .slideY(
                        begin: 0.3,
                        duration: 600.ms,
                        delay: 1400.ms,
                      ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getAmenityIcon(String amenity) {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return Icons.wifi;
      case 'ac':
        return Icons.ac_unit;
      case 'power outlets':
        return Icons.power;
      case 'quiet zone':
        return Icons.volume_off;
      case 'computers':
        return Icons.computer;
      case 'group study':
        return Icons.group;
      case 'printing':
        return Icons.print;
      case 'individual desks':
        return Icons.desktop_windows;
      default:
        return Icons.check_circle;
    }
  }
}












