import SwiftUI

struct NewMessageView: View {
    @EnvironmentObject var theme: ThemeManager
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var mode: ComposeMode = .direct
    @State private var selectedUsers: Set<String> = []
    @State private var groupName = ""
    @State private var navigateToDM: DirectMessage?
    @State private var navigateToGroup: GroupChat?

    enum ComposeMode: String, CaseIterable {
        case direct = "Direct Message"
        case group = "Group Message"
    }

    private var contacts: [User] {
        MockData.users.filter { $0.id != "current" }
    }

    private var filteredContacts: [User] {
        if searchText.isEmpty { return contacts }
        return contacts.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            ($0.title ?? "").localizedCaseInsensitiveContains(searchText) ||
            ($0.department ?? "").localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                MeshBackgroundView()

                VStack(spacing: 0) {
                    // Mode picker
                    VStack(spacing: 12) {
                        HStack(spacing: 8) {
                            ForEach(ComposeMode.allCases, id: \.self) { m in
                                FilterChip(label: m.rawValue, isSelected: mode == m) {
                                    withAnimation(.easeInOut(duration: 0.2)) { mode = m }
                                }
                            }
                        }

                        SearchBarView(text: $searchText, placeholder: "Search people")

                        if mode == .group {
                            GroupNameField(groupName: $groupName)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 8)

                    // Selected users chips (group mode)
                    if mode == .group && !selectedUsers.isEmpty {
                        SelectedUsersBar(
                            selectedUsers: selectedUsers,
                            contacts: contacts,
                            onRemove: { selectedUsers.remove($0) }
                        )
                    }

                    // Contact list
                    ScrollView {
                        LazyVStack(spacing: 2) {
                            // Online section
                            let online = filteredContacts.filter { $0.status == .online || $0.status == .busy }
                            let offline = filteredContacts.filter { $0.status == .away || $0.status == .offline }

                            if !online.isEmpty {
                                Text("Online")
                                    .sectionHeaderStyle()
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal)
                                    .padding(.top, 8)
                                    .padding(.bottom, 4)

                                ForEach(online) { user in
                                    ContactRow(
                                        user: user,
                                        isSelected: selectedUsers.contains(user.id),
                                        showCheckmark: mode == .group
                                    ) {
                                        handleContactTap(user)
                                    }
                                }
                            }

                            if !offline.isEmpty {
                                Text("Away & Offline")
                                    .sectionHeaderStyle()
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal)
                                    .padding(.top, 16)
                                    .padding(.bottom, 4)

                                ForEach(offline) { user in
                                    ContactRow(
                                        user: user,
                                        isSelected: selectedUsers.contains(user.id),
                                        showCheckmark: mode == .group
                                    ) {
                                        handleContactTap(user)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if mode == .group {
                        Button("Create") { createGroup() }
                            .fontWeight(.semibold)
                            .disabled(selectedUsers.count < 2 || groupName.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
            .navigationDestination(item: $navigateToDM) { dm in
                ChatDetailView(chatType: .direct(dm))
            }
            .navigationDestination(item: $navigateToGroup) { group in
                ChatDetailView(chatType: .group(group))
            }
        }
    }

    private func handleContactTap(_ user: User) {
        if mode == .direct {
            // Find existing DM or create new one
            if let existingDM = MockData.directMessages.first(where: { $0.user.id == user.id }) {
                navigateToDM = existingDM
            } else {
                let newDM = DirectMessage(
                    id: UUID().uuidString,
                    user: user,
                    lastMessage: "",
                    lastMessageTime: Date(),
                    unreadCount: 0,
                    messages: [],
                    isPinned: false
                )
                navigateToDM = newDM
            }
        } else {
            if selectedUsers.contains(user.id) {
                selectedUsers.remove(user.id)
            } else {
                selectedUsers.insert(user.id)
            }
        }
    }

    private func createGroup() {
        let members = contacts.filter { selectedUsers.contains($0.id) }
        let allMembers = [MockData.currentUser] + members
        let name = groupName.trimmingCharacters(in: .whitespaces)
        let newGroup = GroupChat(
            id: UUID().uuidString,
            name: name,
            members: allMembers,
            lastMessage: "",
            lastMessageTime: Date(),
            unreadCount: 0,
            messages: [],
            avatar: nil,
            isPinned: false
        )
        navigateToGroup = newGroup
    }
}

// MARK: - Group Name Field

private struct GroupNameField: View {
    @Binding var groupName: String
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "person.3.fill")
                .foregroundStyle(Color(hex: "6C63FF"))
                .font(.subheadline)

            TextField("Group name", text: $groupName)
                .font(.subheadline)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
        .overlay {
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(theme.glassBorder.opacity(0.5), lineWidth: 0.5)
        }
    }
}

// MARK: - Selected Users Bar

private struct SelectedUsersBar: View {
    let selectedUsers: Set<String>
    let contacts: [User]
    let onRemove: (String) -> Void
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(contacts.filter { selectedUsers.contains($0.id) }) { user in
                    HStack(spacing: 6) {
                        AvatarView(initials: user.avatar, size: 22, showStatus: false)
                        Text(user.name.components(separatedBy: " ").first ?? user.name)
                            .font(.caption)
                            .fontWeight(.medium)
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) { onRemove(user.id) }
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.leading, 4)
                    .padding(.trailing, 8)
                    .padding(.vertical, 5)
                    .background(.ultraThinMaterial, in: Capsule())
                    .overlay {
                        Capsule().strokeBorder(theme.glassBorder.opacity(0.4), lineWidth: 0.5)
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.bottom, 8)
    }
}

// MARK: - Contact Row

private struct ContactRow: View {
    let user: User
    let isSelected: Bool
    let showCheckmark: Bool
    let onTap: () -> Void
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                AvatarView(initials: user.avatar, size: 44, status: user.status)

                VStack(alignment: .leading, spacing: 3) {
                    Text(user.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.primary)
                    if let title = user.title {
                        Text(title)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                if let dept = user.department {
                    Text(dept)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(.ultraThinMaterial, in: Capsule())
                }

                if showCheckmark {
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .font(.title3)
                        .foregroundStyle(isSelected ? Color(hex: "6C63FF") : Color.secondary.opacity(0.4))
                        .animation(.easeInOut(duration: 0.15), value: isSelected)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Hashable Conformance for Navigation

extension DirectMessage: @retroactive Hashable {
    static func == (lhs: DirectMessage, rhs: DirectMessage) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

extension GroupChat: @retroactive Hashable {
    static func == (lhs: GroupChat, rhs: GroupChat) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
