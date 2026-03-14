import SwiftUI

struct SpacesListView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var searchText = ""

    private var favoriteSpaces: [Space] {
        MockData.spaces.filter { $0.isFavorite }
    }

    private var otherSpaces: [Space] {
        MockData.spaces.filter { !$0.isFavorite }
    }

    private var filteredSpaces: [Space] {
        if searchText.isEmpty { return MockData.spaces }
        return MockData.spaces.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    SearchBarView(text: $searchText, placeholder: "Search spaces")
                        .padding(.horizontal)

                    if searchText.isEmpty {
                        // Favorites
                        if !favoriteSpaces.isEmpty {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Favorites")
                                    .sectionHeaderStyle()
                                    .padding(.horizontal)

                                ForEach(favoriteSpaces) { space in
                                    NavigationLink(destination: SpaceDetailView(space: space)) {
                                        SpaceCard(space: space)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }

                        // All Spaces
                        VStack(alignment: .leading, spacing: 10) {
                            Text("All Spaces")
                                .sectionHeaderStyle()
                                .padding(.horizontal)

                            ForEach(otherSpaces) { space in
                                NavigationLink(destination: SpaceDetailView(space: space)) {
                                    SpaceCard(space: space)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    } else {
                        ForEach(filteredSpaces) { space in
                            NavigationLink(destination: SpaceDetailView(space: space)) {
                                SpaceCard(space: space)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(.vertical, 8)
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Spaces")
        }
    }
}

// MARK: - Space Card

struct SpaceCard: View {
    let space: Space
    @EnvironmentObject var theme: ThemeManager

    private var totalUnread: Int {
        space.channels.reduce(0) { $0 + $1.unreadCount }
    }

    var body: some View {
        HStack(spacing: 14) {
            SpaceIconView(icon: space.icon, color: space.color, size: 48)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(space.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.primary)

                    if space.isFavorite {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundStyle(.yellow)
                    }
                }

                HStack(spacing: 12) {
                    Label("\(space.channels.count) channels", systemImage: "number")
                    Label("\(space.members.count) members", systemImage: "person.2")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }

            Spacer()

            if totalUnread > 0 {
                UnreadBadge(count: totalUnread)
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(14)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
        .padding(.horizontal)
    }
}
