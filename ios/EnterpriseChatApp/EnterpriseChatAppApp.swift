import SwiftUI

@main
struct EnterpriseChatAppApp: App {
    @StateObject private var themeManager = ThemeManager()
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(themeManager)
                .environmentObject(appState)
                .preferredColorScheme(themeManager.colorScheme)
        }
    }
}
