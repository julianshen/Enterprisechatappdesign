import SwiftUI

struct SpaceDetailView: View {
    let space: Space
    @EnvironmentObject var theme: ThemeManager
    @State private var selectedSection: SpaceSection = .channels
    @State private var channels: [Channel] = []

    enum SpaceSection: String, CaseIterable {
        case channels = "Channels"
        case documents = "Docs"
        case files = "Files"
        case dashboards = "Dashboards"
    }

    var body: some View {
        ZStack {
            MeshBackgroundView()

            VStack(spacing: 0) {
                spaceHeader

                Picker("Section", selection: $selectedSection) {
                    ForEach(SpaceSection.allCases, id: \.self) { section in
                        Text(section.rawValue).tag(section)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.vertical, 8)

                switch selectedSection {
                case .channels: channelsList
                case .documents: SpaceDocumentsView()
                case .files: SpaceFilesView()
                case .dashboards: SpaceDashboardsView(dashboards: space.dashboards)
                }
            }
        }
        .navigationTitle(space.name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if channels.isEmpty {
                channels = space.channels
            }
        }
    }

    private var spaceHeader: some View {
        VStack(spacing: 12) {
            SpaceIconView(icon: space.icon, color: space.color, size: 56)

            if let desc = space.description {
                Text(desc)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            HStack(spacing: -6) {
                ForEach(Array(space.members.prefix(5))) { member in
                    AvatarView(initials: member.avatar, size: 28, showStatus: false)
                        .overlay { Circle().stroke(.ultraThinMaterial, lineWidth: 2) }
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
        .background(.ultraThinMaterial)
    }

    private func togglePin(for channel: Channel) {
        guard let idx = channels.firstIndex(where: { $0.id == channel.id }) else { return }
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            channels[idx].isPinned.toggle()
        }
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private func channelRow(for channel: Channel) -> some View {
        NavigationLink(destination: ChatDetailView(chatType: .channel(channel, space))) {
            ChannelRow(channel: channel)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button { togglePin(for: channel) } label: {
                Label(channel.isPinned ? "Unpin" : "Pin",
                      systemImage: channel.isPinned ? "pin.slash.fill" : "pin.fill")
            }
            .tint(.orange)
        }
    }

    private var channelsList: some View {
        let pinned = channels.filter { $0.isPinned }
        let unpinned = channels.filter { !$0.isPinned }

        return List {
            if !pinned.isEmpty {
                Section {
                    ForEach(pinned) { channel in channelRow(for: channel) }
                } header: {
                    Label("Pinned", systemImage: "pin.fill")
                        .sectionHeaderStyle()
                        .foregroundStyle(.orange)
                        .textCase(nil)
                }
            }

            Section {
                ForEach(unpinned) { channel in channelRow(for: channel) }
            } header: {
                if !pinned.isEmpty {
                    Text("All Channels")
                        .sectionHeaderStyle()
                        .textCase(nil)
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }
}

struct ChannelRow: View {
    let channel: Channel
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: channel.type.icon)
                .font(.subheadline)
                .foregroundStyle(channel.type == .privateChannel ? .orange : .secondary)
                .frame(width: 32, height: 32)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
                .overlay {
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(theme.glassBorder.opacity(0.3), lineWidth: 0.5)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(channel.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                if let desc = channel.description {
                    Text(desc).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                }
            }

            Spacer()

            if channel.unreadCount > 0 { UnreadBadge(count: channel.unreadCount) }
            if channel.isPinned {
                Image(systemName: "pin.fill").font(.caption2).foregroundStyle(.orange)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

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

struct SpaceDashboardsView: View {
    let dashboards: [SpaceDashboard]

    var body: some View {
        if dashboards.isEmpty {
            EmptyStateView(icon: "chart.bar.xaxis", title: "No dashboards", subtitle: "This space doesn't have any dashboards yet")
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

struct DashboardCard: View {
    let dashboard: SpaceDashboard

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: dashboard.icon)
                .font(.title3)
                .foregroundStyle(Color(hex: "6C63FF"))
                .frame(width: 40, height: 40)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                .overlay {
                    RoundedRectangle(cornerRadius: 10)
                        .strokeBorder(Color(hex: "6C63FF").opacity(0.2), lineWidth: 0.5)
                }
                .shadow(color: Color(hex: "6C63FF").opacity(0.2), radius: 4)

            VStack(alignment: .leading, spacing: 2) {
                Text(dashboard.name).font(.subheadline).fontWeight(.semibold)
                Text("\(dashboard.widgets.count) widgets").font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "chevron.right").font(.caption).foregroundStyle(.tertiary)
        }
        .padding(14)
        .glassCard(cornerRadius: 16)
    }
}
