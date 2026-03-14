import SwiftUI

struct ChatsListView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var searchText = ""
    @State private var selectedFilter: ChatFilter = .all
    @State private var showNewMessage = false

    enum ChatFilter: String, CaseIterable {
        case all = "All"
        case direct = "Direct"
        case groups = "Groups"
        case channels = "Channels"
        case unread = "Unread"
    }

    private var filteredDMs: [DirectMessage] {
        var dms = MockData.directMessages
        if !searchText.isEmpty {
            dms = dms.filter { $0.user.name.localizedCaseInsensitiveContains(searchText) || $0.lastMessage.localizedCaseInsensitiveContains(searchText) }
        }
        if selectedFilter == .unread { dms = dms.filter { $0.unreadCount > 0 } }
        return dms
    }

    private var filteredGroups: [GroupChat] {
        var groups = MockData.groupChats
        if !searchText.isEmpty {
            groups = groups.filter { $0.name.localizedCaseInsensitiveContains(searchText) || $0.lastMessage.localizedCaseInsensitiveContains(searchText) }
        }
        if selectedFilter == .unread { groups = groups.filter { $0.unreadCount > 0 } }
        return groups
    }

    private var pinnedChannels: [(channel: Channel, space: Space)] {
        MockData.spaces.flatMap { space in
            space.channels.filter { $0.isPinned }.map { (channel: $0, space: space) }
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                MeshBackgroundView()

                ScrollView {
                    VStack(spacing: 0) {
                        VStack(spacing: 12) {
                            SearchBarView(text: $searchText, placeholder: "Search conversations")

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(ChatFilter.allCases, id: \.self) { filter in
                                        FilterChip(label: filter.rawValue, isSelected: selectedFilter == filter) {
                                            withAnimation(.easeInOut(duration: 0.2)) { selectedFilter = filter }
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 8)

                        // Pinned Channels
                        if !pinnedChannels.isEmpty && selectedFilter != .direct && selectedFilter != .groups {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Pinned Channels")
                                    .sectionHeaderStyle()
                                    .padding(.horizontal)

                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 10) {
                                        ForEach(pinnedChannels, id: \.channel.id) { item in
                                            NavigationLink(destination: ChatDetailView(chatType: .channel(item.channel, item.space))) {
                                                PinnedChannelCard(channel: item.channel, space: item.space)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                    .padding(.horizontal)
                                    .padding(.top, 8)
                                }
                            }
                            .padding(.vertical, 8)
                        }

                        // Chat List
                        LazyVStack(spacing: 2) {
                            // Direct Messages
                            if selectedFilter != .groups && selectedFilter != .channels {
                                if selectedFilter == .all && !filteredDMs.isEmpty {
                                    Text("Direct Messages")
                                        .sectionHeaderStyle()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(.horizontal)
                                        .padding(.top, 8)
                                        .padding(.bottom, 4)
                                }
                                ForEach(filteredDMs) { dm in
                                    NavigationLink(destination: ChatDetailView(chatType: .direct(dm))) {
                                        DirectMessageRow(dm: dm)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }

                            // Groups
                            if selectedFilter != .direct && selectedFilter != .channels {
                                if selectedFilter == .all && !filteredGroups.isEmpty {
                                    Text("Groups")
                                        .sectionHeaderStyle()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(.horizontal)
                                        .padding(.top, 16)
                                        .padding(.bottom, 4)
                                }
                                ForEach(filteredGroups) { group in
                                    NavigationLink(destination: ChatDetailView(chatType: .group(group))) {
                                        GroupChatRow(group: group)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }

                            // Channels (when filter is Channels or All)
                            if selectedFilter == .channels || selectedFilter == .unread {
                                let allChannels = channelList(unreadOnly: selectedFilter == .unread)
                                if !allChannels.isEmpty {
                                    if selectedFilter != .channels {
                                        Text("Channels")
                                            .sectionHeaderStyle()
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.horizontal)
                                            .padding(.top, 16)
                                            .padding(.bottom, 4)
                                    }
                                    ForEach(allChannels, id: \.channel.id) { item in
                                        NavigationLink(destination: ChatDetailView(chatType: .channel(item.channel, item.space))) {
                                            ChannelChatRow(channel: item.channel, space: item.space)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Chat")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showNewMessage = true } label: {
                        Image(systemName: "square.and.pencil")
                            .fontWeight(.medium)
                    }
                }
            }
            .sheet(isPresented: $showNewMessage) {
                NewMessageView()
            }
        }
    }

    private func channelList(unreadOnly: Bool) -> [(channel: Channel, space: Space)] {
        MockData.spaces.flatMap { space in
            space.channels
                .filter { !unreadOnly || $0.unreadCount > 0 }
                .map { (channel: $0, space: space) }
        }
        .sorted { ($0.channel.lastActivity ?? .distantPast) > ($1.channel.lastActivity ?? .distantPast) }
    }
}

// MARK: - Pinned Channel Card

struct PinnedChannelCard: View {
    let channel: Channel
    let space: Space

    var body: some View {
        ZStack(alignment: .topTrailing) {
            VStack(spacing: 8) {
                ZStack(alignment: .bottomTrailing) {
                    SpaceIconView(icon: space.icon, color: space.color, size: 44)

                    Image(systemName: "pin.fill")
                        .font(.system(size: 8))
                        .foregroundStyle(.white)
                        .frame(width: 16, height: 16)
                        .background(Color(hex: "6C63FF"), in: Circle())
                        .overlay { Circle().strokeBorder(.ultraThinMaterial, lineWidth: 1.5) }
                        .offset(x: 4, y: 4)
                }

                VStack(spacing: 2) {
                    Text("#\(channel.name)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .lineLimit(1)
                    Text(space.name)
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
            .frame(width: 88)
            .padding(.vertical, 10)
            .padding(.horizontal, 4)
            .glassCard(cornerRadius: 16)

            if channel.unreadCount > 0 {
                UnreadBadge(count: channel.unreadCount)
                    .offset(x: 6, y: -6)
            }
        }
    }
}

// MARK: - Channel Chat Row

struct ChannelChatRow: View {
    let channel: Channel
    let space: Space
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            ZStack(alignment: .bottomTrailing) {
                Image(systemName: channel.type.icon)
                    .font(.subheadline)
                    .foregroundStyle(channel.type == .privateChannel ? .orange : Color(hex: space.color))
                    .frame(width: 40, height: 40)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                    .overlay {
                        RoundedRectangle(cornerRadius: 10)
                            .strokeBorder(Color(hex: space.color).opacity(0.2), lineWidth: 0.5)
                    }

                if channel.isPinned {
                    Image(systemName: "pin.fill")
                        .font(.system(size: 7))
                        .foregroundStyle(.orange)
                        .offset(x: 2, y: 2)
                }
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text("#\(channel.name)")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text("· \(space.name)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    if let lastActivity = channel.lastActivity {
                        Text(lastActivity.chatTimeString)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                if let desc = channel.description {
                    Text(desc)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            if channel.unreadCount > 0 { UnreadBadge(count: channel.unreadCount) }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Direct Message Row

struct DirectMessageRow: View {
    let dm: DirectMessage
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            AvatarView(initials: dm.user.avatar, size: 48, status: dm.user.status)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(dm.user.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Spacer()
                    Text(dm.lastMessageTime.chatTimeString)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text(dm.lastMessage)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    Spacer()
                    if dm.unreadCount > 0 { UnreadBadge(count: dm.unreadCount) }
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Group Chat Row

struct GroupChatRow: View {
    let group: GroupChat
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            GroupAvatarView(members: group.members, size: 48)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(group.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Spacer()
                    Text(group.lastMessageTime.chatTimeString)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text(group.lastMessage)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    Spacer()
                    if group.unreadCount > 0 { UnreadBadge(count: group.unreadCount) }
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Date Extension

extension Date {
    var chatTimeString: String {
        let calendar = Calendar.current
        if calendar.isDateInToday(self) {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return formatter.string(from: self)
        } else if calendar.isDateInYesterday(self) {
            return "Yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d"
            return formatter.string(from: self)
        }
    }

    var messageTimeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: self)
    }

    var fullDateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy 'at' h:mm a"
        return formatter.string(from: self)
    }

    var relativeDateString: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    var shortDateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: self)
    }
}
