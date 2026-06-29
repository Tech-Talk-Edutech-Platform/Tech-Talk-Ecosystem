import 'package:flutter/material.dart';
import 'package:techtalk/constants/app_theme.dart';

class SharedButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const SharedButton({
    super.key,
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    final padding = EdgeInsets.symmetric(
      horizontal: screenWidth * 0.05, // 5% of screen width
      vertical: 14,
    );

    final fontSize = screenWidth < 360 ? 14.0 : 16.0;

    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        padding: padding,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 6,
        textStyle: TextStyle(fontSize: fontSize),
      ),
      icon: Icon(icon, size: 22),
      label: Text(label),
      onPressed: onPressed,
    );
  }
}
