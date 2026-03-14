import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var themeManager: ThemeManager

    var body: some View {
        TabView(selection: $appState.selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(AppTab.home)

            ChatsListView()
                .tabItem {
                    Label("Chat", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(AppTab.chat)

            SpacesListView()
                .tabItem {
                    Label("Spaces", systemImage: "square.grid.2x2.fill")
                }
                .tag(AppTab.spaces)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(AppTab.profile)
        }
        .tint(themeManager.accentColor)
    }
}

enum AppTab: Hashable {
    case home, chat, spaces, profile
}

class AppState: ObservableObject {
    @Published var selectedTab: AppTab = .home
    @Published var currentUser: User = MockData.currentUser
}
