# Hack AI Todo - Frontend

This is the React Native frontend for the Hack AI Todo application. It provides a user-friendly interface for managing tasks, learning languages, and interacting with an AI assistant.

## Features

### 🏠 Home Screen

- **Auto-Fetch Content**: Automatically fetches helpful content based on your selected language and level.
- **Accordion Interface**: Content is organized in expandable blocks. Only one block is open at a time for a clean view.
- **Persistent Checkboxes**: Track your progress within content blocks. Checkbox states are saved even when you close and reopen sections.
- **Skeleton Loading**: Smooth loading animations while fetching data.

### 💬 Conversation

- **AI Chat**: Interact with an AI assistant for language practice or help.
- **Voice Integration**: (Planned/In-progress) Voice interaction capabilities.

### ⚙️ Settings

- **Profile Management**: Set your name and surname.
- **Language Management**: Add, edit, and delete languages you are learning.
- **Auto-Save**:
  - **Text Fields**: Changes to name and surname are saved automatically after you stop typing (debounced).
  - **Languages**: Adding, updating, or deleting languages saves immediately.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Bottom Tabs)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Storage**: `AsyncStorage` for local data persistence.
- **Animations**: `Animated` and `LayoutAnimation` for smooth UI transitions.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo Go](https://expo.dev/client) app on your iOS or Android device (or an emulator).

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npx expo start
```

- **Scan the QR code** with the Expo Go app on your phone.
- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator.

## Project Structure

```
frontend/
├── assets/              # Images and static assets
├── screens/             # Main screen components
│   ├── HomeScreen.js        # Main dashboard with accordion content
│   ├── ConversationScreen.js # AI chat interface
│   └── SettingsScreen.js    # User settings and language management
├── services/            # API and storage services
│   ├── HelpService.js       # Fetches help content from backend
│   ├── TaskService.js       # Submits completed tasks
│   └── UserDataService.js   # Manages local user data (AsyncStorage)
├── utils/               # Helper components and functions
│   ├── ExpandableJsonBlock.js # Accordion component with state management
│   ├── TaskChecklistRenderer.js # Renders tasks with checkboxes
│   ├── emojiRenderer.js     # Renders text with large emojis
│   └── languageUtils.js     # Language flags and level indicators
└── App.js               # Main entry point and navigation setup
```

## Key Components

### `ExpandableJsonBlocks`

A smart component that renders JSON data as an accordion.

- **Accordion Behavior**: Ensures only one section is expanded at a time.
- **State Lifting**: Manages the `checkedItems` state for all children to ensure persistence.
- **Custom Animation**: Uses a 200ms `LayoutAnimation` for snappy transitions.

### `TaskChecklistRenderer`

Renders lists of tasks with interactive checkboxes.

- **Accessibility**: Entire rows are clickable.
- **Styling**: distinct styles for checked vs. unchecked states.
- **Integration**: Receives state and toggle handlers from `ExpandableJsonBlocks`.

## API Integration

The frontend communicates with a backend server (expected at `http://localhost:8000` or your network IP).

- **`GET /help`**: Fetches educational content.
- **`POST /task`**: Submits completed tasks.
