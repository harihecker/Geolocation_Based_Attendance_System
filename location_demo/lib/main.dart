import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async'; 

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Get Current Location',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: LocationExample(),
    );
  }
}

class LocationExample extends StatefulWidget {
  @override
  _LocationExampleState createState() => _LocationExampleState();
}

class _LocationExampleState extends State<LocationExample> {
  Position? _currentPosition;
  String? _errorMessage;
  final String serverUrl = 'http://192.168.105.41:8080/admin/location'; // Your Node.js server URL
  StreamSubscription<Position>? _positionStreamSubscription;

  @override
  void initState() {
    super.initState();
    _checkPermissionsAndLocationService();
    _startListeningForLocationChanges();
  }

  Future<void> _startListeningForLocationChanges() async {
    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high, // Use high accuracy
        distanceFilter: 10, // Minimum distance change to trigger updates (in meters)
      ),
    ).listen((Position position) {
      setState(() {
        _currentPosition = position;
      });
    });
  }

  Future<void> _checkPermissionsAndLocationService() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _errorMessage = 'Location services are disabled. Please enable them.';
      });
      _showEnableLocationDialog();
      return;
    }

    // Check for location permission
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _errorMessage = 'Location permission denied. Please allow location access.';
        });
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _errorMessage = 'Location permission permanently denied. Please enable it in app settings.';
        openAppSettings();
      });
      return;
    }
  }

  Future<void> _sendLocationToServer() async {
    if (_currentPosition != null) {
      try {
        Map<String, dynamic> locationData = {
          'latitude': _currentPosition!.latitude,
          'longitude': _currentPosition!.longitude,
        };
        print(locationData);

        // Send a POST request to the server
        var response = await http.post(
          Uri.parse(serverUrl),
          headers: {"Content-Type": "application/json"},
          body: json.encode(locationData),
        );

        if (response.statusCode == 200) {
          print('Location sent successfully!');
        } else {
          print('Failed to send location. Status code: ${response.statusCode}');
        }
      } catch (e) {
        print('Error sending location to server: $e');
      }
    } else {
      setState(() {
        _errorMessage = 'No location data to send.';
      });
    }
  }

  void _showEnableLocationDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Enable Location Services'),
          content: Text('Location services are disabled. Please enable them to proceed.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                await Geolocator.openLocationSettings();
                Navigator.pop(context);
              },
              child: Text('Enable'),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _positionStreamSubscription?.cancel(); // Clean up stream when widget is disposed
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Current Location')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _currentPosition != null
                ? Text(
                    'Latitude: ${_currentPosition!.latitude}, Longitude: ${_currentPosition!.longitude}',
                    style: TextStyle(fontSize: 18),
                  )
                : _errorMessage != null
                    ? Text(_errorMessage!, style: TextStyle(color: Colors.red, fontSize: 18))
                    : CircularProgressIndicator(),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _sendLocationToServer,
              child: Text('Send Location to Server'),
            ),
          ],
        ),
      ),
    );
  }
}
