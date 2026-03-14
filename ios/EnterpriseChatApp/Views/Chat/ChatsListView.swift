import SwiftUI

struct ChatsListView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var searchText = ""
    @State private var selectedFilter: ChatFilter = .all

    enum ChatFilter: String, CaseIterable {
        case all = "All"
        case direct = "Direct"
        case groups = "Groups"
        case unread = "Unread"
    }

    private var filteredDMs: [DirectMessage] {
        var dms = MockData.directMessages
        if !searchText.isEmpty {
            dms = dms.filter { $0.user.name.localizedCaseInsensitiveContains(searchText) || $0.lastMessage.localizedCaseInsensitiveContains(searchText) }
        }
        if selectedFilter == .unread {
            dms = dms.filter { $0.unreadCount > 0 }
        }
        return dms
    }

    private var filteredGroups: [GroupChat] {
        var groups = MockData.groupChats
        if !searchText.isEmpty {
            groups = groups.filter { $0.name.localizedCaseInsensitiveContains(searchText) || $0.lastMessage.localizedCaseInsensitiveContains(searchText) }
        }
        if selectedFilter == .unread {
            groups = groups.filter { $0.unreadCount > 0 }
        }
        return groups
    }

    private var pinnedChats: [DirectMessage] {
        filteredDMs.filter { $0.isPinned }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Search & Filters
                    VStack(spacing: 12) {
                        SearchBarView(text: $searchText, placeholder: "Search conversations")

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(ChatFilter.allCases, id: \.self) { filter in
                                    FilterChip(
                                        label: filter.rawValue,
                                        isSelected: selectedFilter == filter
                                    ) {
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            selectedFilter = filter
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 8)

                    // Pinned Section
                    if selectedFilter != .groups && !pinnedChats.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Pinned")
                                .sectionHeaderStyle()
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(pinnedChats) { dm in
                                        NavigationLink(destination: ChatDetailView(chatType: .direct(dm))) {
                                            PinnedChatCard(dm: dm)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding(.vertical, 8)
                    }

                    // Chat List
                    LazyVStack(spacing: 0) {
                        if selectedFilter != .groups {
                            ForEach(filteredDMs.filter { !$0.isPinned }) { dm in
                                NavigationLink(destination: ChatDetailView(chatType: .direct(dm))) {
                                    DirectMessageRow(dm: dm)
                                }
                                .buttonStyle(.plain)
                            }
                        }

                        if selectedFilter != .direct {
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
                    }
                }
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Chat")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                    } label: {
                        Image(systemName: "square.and.pencil")
                            .fontWeight(.medium)
                    }
                }
            }
        }
    }
}

// MARK: - Pinned Chat Card

struct PinnedChatCard: View {
    let dm: DirectMessage
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(spacing: 8) {
            AvatarView(initials: dm.user.avatar, size: 48, status: dm.user.status)

            VStack(spacing: 2) {
                Text(dm.user.name.components(separatedBy: " ").first ?? "")
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)

                if dm.unreadCount > 0 {
                    UnreadBadge(count: dm.unreadCount)
                }
            }
        }
        .frame(width: 72)
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
                        .foregroundStyle(.primary)

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

                    if dm.unreadCount > 0 {
                        UnreadBadge(count: dm.unreadCount)
                    }
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
                        .foregroundStyle(.primary)

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

                    if group.unreadCount > 0 {
                        UnreadBadge(count: group.unreadCount)
                    }
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
}
