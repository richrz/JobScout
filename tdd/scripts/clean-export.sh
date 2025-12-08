# Define the output directory
DIST_DIR="dist/tdd-kit"

echo "🧹 Cleaning previous build..."
rm -rf dist

echo "📂 Creating distribution folder..."
mkdir -p "$DIST_DIR"

# Copy Root Docs
echo "📄 Copying documentation..."
cp README.md "$DIST_DIR/"
cp TDD-AGENTS.md "$DIST_DIR/"
cp TDD-auditor.md "$DIST_DIR/"
cp TDD-Manual.md "$DIST_DIR/"

# Copy Scripts
echo "📜 Copying scripts..."
mkdir -p "$DIST_DIR/scripts"
cp scripts/*.sh "$DIST_DIR/scripts/"

# Copy User Folder (The Control Panel)
echo "👤 Copying user guides..."
mkdir -p "$DIST_DIR/user"
cp -r user/* "$DIST_DIR/user/"

# Copy Docs Structure (Empty templates)
echo "📁 Copying docs structure..."
mkdir -p "$DIST_DIR/docs/audits"
mkdir -p "$DIST_DIR/docs/hitl-verify"
cp docs/hitl-verify/README.txt "$DIST_DIR/docs/hitl-verify/"

# Copy Agent Definitions (if needed)
echo "🤖 Copying agent definitions..."
if [ -d "agent-definitions" ]; then
  cp -r agent-definitions "$DIST_DIR/"
fi
if [ -d "auto-install" ]; then
  cp -r auto-install "$DIST_DIR/"
fi

echo "✅ Done!"
echo "   Clean export available at: $DIST_DIR"

