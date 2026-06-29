import 'package:flutter/material.dart';

class ScratchBuilderScreen extends StatefulWidget {
  const ScratchBuilderScreen({super.key});

  @override
  State<ScratchBuilderScreen> createState() => _ScratchBuilderScreenState();
}

class _ScratchBuilderScreenState extends State<ScratchBuilderScreen> {
  final List<String> palette = [
    "Move 10 steps",
    "Turn 15 degrees",
    "Repeat 5 times",
    "Say Hello",
    "Increase Score"
  ];

  final List<String> workspace = [];

  String result = "";
  int x = 0;
  int score = 0;

  // ---------------- RUN ENGINE ----------------
  void runProgram() {
    int tempX = 0;
    int tempScore = 0;

    for (final block in workspace) {
      if (block.contains("Move")) {
        tempX += 10;
      }

      if (block.contains("Turn")) {
        tempX += 1; // simple placeholder logic
      }

      if (block.contains("Repeat")) {
        for (int i = 0; i < 5; i++) {
          tempScore += 1;
        }
      }

      if (block.contains("Increase Score")) {
        tempScore += 10;
      }
    }

    setState(() {
      x = tempX;
      score = tempScore;
      result = "Sprite X: $x | Score: $score";
    });
  }

  // ---------------- RESET ----------------
  void reset() {
    setState(() {
      workspace.clear();
      result = "";
      x = 0;
      score = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Scratch Builder Exam"),
        backgroundColor: Colors.orangeAccent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: reset,
          ),
        ],
      ),

      body: Row(
        children: [
          // ---------------- PALETTE ----------------
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.grey[200],
              child: ListView(
                padding: const EdgeInsets.all(10),
                children: palette.map((block) {
                  return Draggable<String>(
                    data: block,
                    feedback: Material(
                      child: _blockTile(block, Colors.blueAccent),
                    ),
                    childWhenDragging:
                        _blockTile(block, Colors.grey),
                    child: _blockTile(block, Colors.blue),
                  );
                }).toList(),
              ),
            ),
          ),

          // ---------------- WORKSPACE ----------------
          Expanded(
            flex: 3,
            child: Container(
              padding: const EdgeInsets.all(10),
              color: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Workspace (Drop blocks here)",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 10),

                  Expanded(
                    child: DragTarget<String>(
                      onAccept: (block) {
                        setState(() {
                          workspace.add(block);
                        });
                      },
                      builder: (context, candidate, rejected) {
                        return Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: workspace.isEmpty
                              ? const Center(
                                  child: Text("Drop blocks here"),
                                )
                              : ListView(
                                  children: workspace
                                      .map((b) => _workspaceTile(b))
                                      .toList(),
                                ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 10),

                  // ---------------- RUN BUTTON ----------------
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orangeAccent,
                      ),
                      onPressed: runProgram,
                      child: const Text("RUN PROGRAM"),
                    ),
                  ),

                  const SizedBox(height: 10),

                  Text(
                    result,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- BLOCK UI ----------------
  Widget _blockTile(String text, Color color) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white),
      ),
    );
  }

  // ---------------- WORKSPACE TILE ----------------
  Widget _workspaceTile(String text) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 5),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.orange[100],
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(text),
    );
  }
}