import SwiftUI

struct SpaceDetailView: View {
    let space: Space
    @EnvironmentObject var theme: ThemeManager
    @State private var selectedSection: SpaceSection = .channels

    enum SpaceSection: String, CaseIterable {
        case channels = "Channels"
        case documents = "Docs"
        case files = "Files"
        case dashboards = "Dashboards"
    }

    var body: some View {
        VStack(spacing: 0) {
            // Space header
            spaceHeader

            // Section picker
            Picker("Section", selection: $selectedSection) {
                ForEach(SpaceSection.allCases, id: \.self) { section in
                    Text(section.rawValue).tag(section)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.vertical, 8)

            // Content
            switch selectedSection {
            case .channels:
                channelsList
            case .documents:
                SpaceDocumentsView()
            case .files:
                SpaceFilesView()
            case .dashboards:
                SpaceDashboardsView(dashboards: space.dashboards)
            }
        }
        .background(theme.surfaceBackground)
        .navigationTitle(space.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Space Header

    private var spaceHeader: some View {
        VStack(spacing: 12) {
            SpaceIconView(icon: space.icon, color: space.color, size: 56)

            if let desc = space.description {
                Text(desc)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            // Member avatars
            HStack(spacing: -6) {
                ForEach(Array(space.members.prefix(5))) { member in
                    AvatarView(initials: member.avatar, size: 28, showStatus: false)
                        .overlay {
                            Circle().stroke(theme.surfaceBackground, lineWidth: 2)
                        }
                }
                if space.members.count > 5 {
                    Text("+\(space.members.count - 5)")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundStyle(.secondary)
                        .frame(width: 28, height: 28)
                        .background(.ultraThinMaterial, in: Circle())
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(theme.cardBackground)
    }

    // MARK: - Channels List

    private var channelsList: some View {
        ScrollView {
            LazyVStack(spacing: 2) {
                ForEach(space.channels) { channel in
                    NavigationLink(destination: ChatDetailView(chatType: .channel(channel, space))) {
                        ChannelRow(channel: channel)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.vertical, 8)
        }
    }
}

// MARK: - Channel Row

struct ChannelRow: View {
    let channel: Channel
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: channel.type.icon)
                .font(.subheadline)
                .foregroundStyle(channel.type == .privateChannel ? .orange : .secondary)
                .frame(width: 32, height: 32)
                .background(theme.subtleBackground, in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(channel.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)

                if let desc = channel.description {
                    Text(desc)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            if channel.unreadCount > 0 {
                UnreadBadge(count: channel.unreadCount)
            }

            if channel.isPinned {
                Image(systemName: "pin.fill")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Space Documents View

struct SpaceDocumentsView: View {
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                ForEach(MockData.documents.prefix(3)) { doc in
                    NavigationLink(destination: DocumentDetailView(document: doc)) {
                        DocumentRow(document: doc)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
        }
    }
}

// MARK: - Space Files View

struct SpaceFilesView: View {
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                ForEach(MockData.files.prefix(5)) { file in
                    FileRow(file: file)
                }
            }
            .padding()
        }
    }
}

// MARK: - Space Dashboards View

struct SpaceDashboardsView: View {
    let dashboards: [SpaceDashboard]

    var body: some View {
        if dashboards.isEmpty {
            EmptyStateView(
                icon: "chart.bar.xaxis",
                title: "No dashboards",
                subtitle: "This space doesn't have any dashboards yet"
            )
        } else {
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(dashboards) { dashboard in
                        NavigationLink(destination: DashboardDetailView(dashboard: dashboard)) {
                            DashboardCard(dashboard: dashboard)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
        }
    }
}

// MARK: - Dashboard Card

struct DashboardCard: View {
    let dashboard: SpaceDashboard
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: dashboard.icon)
                .font(.title3)
                .foregroundStyle(Color(hex: "5B5FC7"))
                .frame(width: 40, height: 40)
                .background(Color(hex: "5B5FC7").opacity(0.1), in: RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 2) {
                Text(dashboard.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)

                Text("\(dashboard.widgets.count) widgets")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(14)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
    }
}
