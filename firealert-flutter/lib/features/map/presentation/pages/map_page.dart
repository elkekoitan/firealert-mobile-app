import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

class MapPage extends StatefulWidget {
  const MapPage({super.key});

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  Set<Marker> _markers = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      // Check permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return;
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _currentPosition = position;
        _isLoading = false;
      });

      // Move camera to current location
      _mapController?.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: LatLng(position.latitude, position.longitude),
            zoom: 15.0,
          ),
        ),
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Konum alınamadı: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('FireAlert Haritası'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _getCurrentLocation,
          ),
        ],
      ),
      body: _currentPosition == null
          ? const Center(
              child: Text('Konum erişimi gerekli'),
            )
          : GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;
              },
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  _currentPosition!.latitude,
                  _currentPosition!.longitude,
                ),
                zoom: 15.0,
              ),
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              markers: _markers,
              onCameraMove: (CameraPosition position) {
                // Load fire reports for visible area
                _loadFireReports(position.target);
              },
            ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'location',
            onPressed: _getCurrentLocation,
            backgroundColor: Colors.blue,
            child: const Icon(Icons.my_location, color: Colors.white),
          ),
          const SizedBox(height: 16),
          FloatingActionButton(
            heroTag: 'report',
            onPressed: () {
              // Navigate to create report page
            },
            backgroundColor: Colors.red,
            child: const Icon(Icons.add, color: Colors.white),
          ),
        ],
      ),
    );
  }

  Future<void> _loadFireReports(LatLng center) async {
    // TODO: Implement fire reports loading from Supabase
    // This will be implemented when we add the reports BLoC
  }
}
