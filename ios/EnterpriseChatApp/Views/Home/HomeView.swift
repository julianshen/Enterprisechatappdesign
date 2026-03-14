import SwiftUI

struct HomeView: View {
    @EnvironmentObject var theme: ThemeManager
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Greeting
                    greetingCard

                    // Quick Stats
                    quickStats

                    // Unread Chats
                    unreadSection

                    // Recent Activity
                    activitySection

                    // Favorite Spaces
                    favoriteSpaces

                    // Recent Documents
                    recentDocuments
                }
                .padding(.vertical, 8)
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Home")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: InboxView()) {
                        Image(systemName: "bell")
                            .fontWeight(.medium)
                            .overlay(alignment: .topTrailing) {
                                let unreadCount = MockData.activities.filter { !$0.isRead }.count
                                if unreadCount > 0 {
                                    Circle()
                                        .fill(.red)
                                        .frame(width: 8, height: 8)
                                        .offset(x: 2, y: -2)
                                }
                            }
                    }
                }
            }
        }
    }

    // MARK: - Greeting

    private var greetingCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(greetingText)
                .font(.title2)
                .fontWeight(.bold)

            Text("You have \(unreadMessageCount) unread messages and \(MockData.activities.filter { !$0.isRead }.count) notifications")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(
            LinearGradient(
                colors: [Color(hex: "5B5FC7").opacity(0.08), Color(hex: "2196F3").opacity(0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 16)
        )
        .padding(.horizontal)
    }

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let firstName = appState.currentUser.name.components(separatedBy: " ").first ?? ""
        switch hour {
        case 5..<12: return "Good morning, \(firstName)"
        case 12..<17: return "Good afternoon, \(firstName)"
        default: return "Good evening, \(firstName)"
        }
    }

    private var unreadMessageCount: Int {
        MockData.directMessages.reduce(0) { $0 + $1.unreadCount } +
        MockData.groupChats.reduce(0) { $0 + $1.unreadCount }
    }

    // MARK: - Quick Stats

    private var quickStats: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                QuickStatCard(icon: "bubble.left.fill", label: "Messages", value: "\(unreadMessageCount)", color: Color(hex: "5B5FC7"))
                QuickStatCard(icon: "doc.text.fill", label: "Documents", value: "\(MockData.documents.count)", color: .blue)
                QuickStatCard(icon: "square.grid.2x2.fill", label: "Spaces", value: "\(MockData.spaces.count)", color: .orange)
                QuickStatCard(icon: "doc.fill", label: "Files", value: "\(MockData.files.count)", color: .green)
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Unread Chats

    private var unreadSection: some View {
        let unreadDMs = MockData.directMessages.filter { $0.unreadCount > 0 }
        return Group {
            if !unreadDMs.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Unread Messages")
                            .sectionHeaderStyle()

                        Spacer()

                        Button {
                            appState.selectedTab = .chat
                        } label: {
                            Text("See All")
                                .font(.caption)
                                .foregroundStyle(Color(hex: "5B5FC7"))
                        }
                    }
                    .padding(.horizontal)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(unreadDMs) { dm in
                                UnreadChatCard(dm: dm)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
        }
    }

    // MARK: - Activity

    private var activitySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Recent Activity")
                    .sectionHeaderStyle()

                Spacer()

                NavigationLink(destination: InboxView()) {
                    Text("See All")
                        .font(.caption)
                        .foregroundStyle(Color(hex: "5B5FC7"))
                }
            }
            .padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(MockData.activities.prefix(4)) { activity in
                    ActivityRow(activity: activity)

                    if activity.id != MockData.activities.prefix(4).last?.id {
                        Divider()
                            .padding(.leading, 52)
                    }
                }
            }
            .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal)
        }
    }

    // MARK: - Favorite Spaces

    private var favoriteSpaces: some View {
        let favorites = MockData.spaces.filter { $0.isFavorite }
        return Group {
            if !favorites.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Favorite Spaces")
                        .sectionHeaderStyle()
                        .padding(.horizontal)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(favorites) { space in
                                NavigationLink(destination: SpaceDetailView(space: space)) {
                                    FavoriteSpaceCard(space: space)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
        }
    }

    // MARK: - Recent Documents

    private var recentDocuments: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Recent Documents")
                .sectionHeaderStyle()
                .padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(MockData.documents.prefix(3)) { doc in
                    NavigationLink(destination: DocumentDetailView(document: doc)) {
                        HStack(spacing: 12) {
                            Text(doc.icon)
                                .font(.title3)
                                .frame(width: 36)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(doc.title)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.primary)
                                    .lineLimit(1)

                                Text("Updated \(doc.updatedAt.relativeDateString)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                    }
                    .buttonStyle(.plain)

                    if doc.id != MockData.documents.prefix(3).last?.id {
                        Divider()
                            .padding(.leading, 60)
                    }
                }
            }
            .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal)
        }
    }
}

// MARK: - Quick Stat Card

struct QuickStatCard: View {
    let icon: String
    let label: String
    let value: String
    let color: Color
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)

            Text(value)
                .font(.title2)
                .fontWeight(.bold)

            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(width: 80, height: 88)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Unread Chat Card

struct UnreadChatCard: View {
    let dm: DirectMessage
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(spacing: 8) {
            AvatarView(initials: dm.user.avatar, size: 44, status: dm.user.status)

            VStack(spacing: 2) {
                Text(dm.user.name.components(separatedBy: " ").first ?? "")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)

                UnreadBadge(count: dm.unreadCount)
            }
        }
        .frame(width: 72)
    }
}

// MARK: - Activity Row

struct ActivityRow: View {
    let activity: Activity
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: activity.icon)
                .font(.subheadline)
                .foregroundStyle(activity.color)
                .frame(width: 32, height: 32)
                .background(activity.color.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(activity.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                Text(activity.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            Text(activity.timestamp.relativeDateString)
                .font(.caption2)
                .foregroundStyle(.tertiary)

            if !activity.isRead {
                Circle()
                    .fill(Color(hex: "5B5FC7"))
                    .frame(width: 6, height: 6)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}

// MARK: - Favorite Space Card

struct FavoriteSpaceCard: View {
    let space: Space
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(spacing: 10) {
            SpaceIconView(icon: space.icon, color: space.color, size: 44)

            VStack(spacing: 2) {
                Text(space.name)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)

                let unread = space.channels.reduce(0) { $0 + $1.unreadCount }
                if unread > 0 {
                    Text("\(unread) new")
                        .font(.caption2)
                        .foregroundStyle(Color(hex: "5B5FC7"))
                } else {
                    Text("\(space.channels.count) ch")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(width: 80, height: 96)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
    }
}
