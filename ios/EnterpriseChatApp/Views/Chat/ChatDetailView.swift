import SwiftUI

enum ChatType {
    case direct(DirectMessage)
    case group(GroupChat)
    case channel(Channel, Space)

    var title: String {
        switch self {
        case .direct(let dm): return dm.user.name
        case .group(let gc): return gc.name
        case .channel(let ch, _): return "#\(ch.name)"
        }
    }

    var messages: [Message] {
        switch self {
        case .direct(let dm): return dm.messages
        case .group(let gc): return gc.messages
        case .channel(let ch, _): return ch.messages
        }
    }
}

struct ChatDetailView: View {
    let chatType: ChatType
    @EnvironmentObject var theme: ThemeManager
    @State private var messageText = ""
    @State private var showThread: Message? = nil
    @State private var showReactions: Message? = nil
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 2) {
                        ForEach(chatType.messages) { message in
                            MessageBubbleView(
                                message: message,
                                isCurrentUser: message.userId == "current",
                                onThread: { showThread = message },
                                onReaction: { showReactions = message }
                            )
                            .id(message.id)
                        }
                    }
                    .padding(.vertical, 8)
                }
            }

            // Input Bar
            MessageInputBar(text: $messageText) {
                sendMessage()
            }
        }
        .background(theme.surfaceBackground)
        .navigationTitle(chatType.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                chatToolbar
            }
        }
        .sheet(item: $showThread) { message in
            ThreadView(parentMessage: message)
        }
    }

    @ViewBuilder
    private var chatToolbar: some View {
        HStack(spacing: 16) {
            switch chatType {
            case .direct(let dm):
                AvatarView(initials: dm.user.avatar, size: 28, status: dm.user.status)
            case .group:
                Button { } label: {
                    Image(systemName: "person.2")
                }
            case .channel:
                Button { } label: {
                    Image(systemName: "info.circle")
                }
            }
        }
    }

    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        messageText = ""
    }
}

// MARK: - Message Bubble

struct MessageBubbleView: View {
    let message: Message
    let isCurrentUser: Bool
    var onThread: (() -> Void)?
    var onReaction: (() -> Void)?
    @EnvironmentObject var theme: ThemeManager

    private var user: User {
        MockData.user(by: message.userId)
    }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if !isCurrentUser {
                AvatarView(initials: user.avatar, size: 32, showStatus: false)
            }

            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                if !isCurrentUser {
                    HStack(spacing: 6) {
                        Text(user.name)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(.primary)

                        Text(message.timestamp.messageTimeString)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)

                        if message.isPinned {
                            Image(systemName: "pin.fill")
                                .font(.system(size: 9))
                                .foregroundStyle(.orange)
                        }

                        if message.isEdited {
                            Text("(edited)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                    }
                }

                // Content bubble
                Text(message.content)
                    .font(.subheadline)
                    .foregroundStyle(isCurrentUser ? .white : .primary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(
                        isCurrentUser
                            ? Color(hex: "5B5FC7")
                            : theme.cardBackground,
                        in: RoundedRectangle(cornerRadius: 18)
                    )
                    .contextMenu {
                        Button { onReaction?() } label: {
                            Label("React", systemImage: "face.smiling")
                        }
                        Button { onThread?() } label: {
                            Label("Reply in Thread", systemImage: "arrowshape.turn.up.left")
                        }
                        Button { } label: {
                            Label("Copy", systemImage: "doc.on.doc")
                        }
                        if message.isPinned {
                            Button { } label: {
                                Label("Unpin", systemImage: "pin.slash")
                            }
                        } else {
                            Button { } label: {
                                Label("Pin", systemImage: "pin")
                            }
                        }
                    }

                if isCurrentUser {
                    Text(message.timestamp.messageTimeString)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }

                // Reactions
                if !message.reactions.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(message.reactions) { reaction in
                            HStack(spacing: 3) {
                                Text(reaction.emoji)
                                    .font(.caption)
                                Text("\(reaction.count)")
                                    .font(.caption2)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.ultraThinMaterial, in: Capsule())
                        }
                    }
                }

                // Thread indicator
                if !message.threadReplies.isEmpty {
                    Button { onThread?() } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "arrowshape.turn.up.left.fill")
                                .font(.caption2)
                            Text("\(message.threadReplies.count) replies")
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundStyle(Color(hex: "5B5FC7"))
                    }
                }

                // Attachments
                ForEach(message.attachments) { attachment in
                    AttachmentPreview(attachment: attachment)
                }
            }

            if isCurrentUser {
                // Space for symmetry
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 4)
        .frame(maxWidth: .infinity, alignment: isCurrentUser ? .trailing : .leading)
    }
}

// MARK: - Attachment Preview

struct AttachmentPreview: View {
    let attachment: MessageAttachment
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: iconForType)
                .font(.title3)
                .foregroundStyle(colorForType)
                .frame(width: 36, height: 36)
                .background(colorForType.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(attachment.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)

                if let size = attachment.size {
                    Text(size)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Image(systemName: "arrow.down.circle")
                .foregroundStyle(.secondary)
        }
        .padding(10)
        .background(theme.subtleBackground, in: RoundedRectangle(cornerRadius: 12))
        .frame(maxWidth: 260)
    }

    private var iconForType: String {
        switch attachment.type {
        case .image: return "photo.fill"
        case .file: return "doc.fill"
        case .video: return "play.rectangle.fill"
        case .document: return "doc.text.fill"
        case .task: return "checkmark.circle.fill"
        }
    }

    private var colorForType: Color {
        switch attachment.type {
        case .image: return .purple
        case .file: return .blue
        case .video: return .pink
        case .document: return .orange
        case .task: return .green
        }
    }
}

// MARK: - Message Input

struct MessageInputBar: View {
    @Binding var text: String
    let onSend: () -> Void
    @EnvironmentObject var theme: ThemeManager
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            Divider()

            HStack(alignment: .bottom, spacing: 8) {
                Button { } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.secondary)
                }

                HStack(alignment: .bottom, spacing: 8) {
                    TextField("Type a message...", text: $text, axis: .vertical)
                        .font(.subheadline)
                        .lineLimit(1...5)
                        .focused($isFocused)

                    Button { } label: {
                        Image(systemName: "face.smiling")
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(theme.subtleBackground, in: RoundedRectangle(cornerRadius: 22))

                Button(action: onSend) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(text.isEmpty ? .secondary : Color(hex: "5B5FC7"))
                }
                .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(theme.elevatedBackground)
        }
    }
}

// MARK: - Thread View

struct ThreadView: View {
    let parentMessage: Message
    @EnvironmentObject var theme: ThemeManager
    @State private var replyText = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 0) {
                        // Parent message
                        MessageBubbleView(
                            message: parentMessage,
                            isCurrentUser: parentMessage.userId == "current"
                        )
                        .padding(.bottom, 8)

                        Divider()
                            .padding(.horizontal)

                        if parentMessage.threadReplies.isEmpty {
                            EmptyStateView(
                                icon: "bubble.left.and.bubble.right",
                                title: "No replies yet",
                                subtitle: "Start a thread conversation"
                            )
                        } else {
                            ForEach(parentMessage.threadReplies) { reply in
                                MessageBubbleView(
                                    message: reply,
                                    isCurrentUser: reply.userId == "current"
                                )
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }

                MessageInputBar(text: $replyText) { }
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Thread")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

extension Message: @retroactive Hashable {
    static func == (lhs: Message, rhs: Message) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
