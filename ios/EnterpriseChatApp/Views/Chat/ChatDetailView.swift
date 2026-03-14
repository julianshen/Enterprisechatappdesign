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
    @State private var reactingToMessage: Message? = nil
    @State private var reactionStore: [String: [Reaction]] = [:]
    @State private var showInputEmojiPicker = false
    @State private var replyingTo: Message? = nil
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            MeshBackgroundView()

            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 2) {
                            ForEach(chatType.messages) { message in
                                MessageBubbleView(
                                    message: message,
                                    isCurrentUser: message.userId == "current",
                                    reactions: reactionStore[message.id] ?? message.reactions,
                                    onThread: { showThread = message },
                                    onReply: { withAnimation(.easeInOut(duration: 0.2)) { replyingTo = message } },
                                    onReact: { reactingToMessage = message },
                                    onToggleReaction: { emoji in toggleReaction(emoji, on: message) }
                                )
                                .id(message.id)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                MessageInputBar(
                    text: $messageText,
                    replyingTo: $replyingTo,
                    onEmoji: { showInputEmojiPicker = true }
                ) { sendMessage() }
            }
        }
        .navigationTitle(chatType.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                switch chatType {
                case .direct(let dm):
                    AvatarView(initials: dm.user.avatar, size: 28, status: dm.user.status)
                case .group:
                    Button { } label: { Image(systemName: "person.2") }
                case .channel:
                    Button { } label: { Image(systemName: "info.circle") }
                }
            }
        }
        .sheet(item: $showThread) { message in
            ThreadView(parentMessage: message)
        }
        .sheet(item: $reactingToMessage) { message in
            EmojiPickerSheet(
                existingReactions: reactionStore[message.id] ?? message.reactions
            ) { emoji in
                toggleReaction(emoji, on: message)
                reactingToMessage = nil
            }
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $showInputEmojiPicker) {
            EmojiPickerSheet(existingReactions: []) { emoji in
                messageText += emoji
                showInputEmojiPicker = false
            }
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
        .onAppear {
            for message in chatType.messages where !message.reactions.isEmpty {
                reactionStore[message.id] = message.reactions
            }
        }
    }

    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        messageText = ""
        replyingTo = nil
    }

    private func toggleReaction(_ emoji: String, on message: Message) {
        var reactions = reactionStore[message.id] ?? message.reactions

        if let index = reactions.firstIndex(where: { $0.emoji == emoji }) {
            var reaction = reactions[index]
            if reaction.users.contains("current") {
                reaction.users.removeAll { $0 == "current" }
                reaction.count -= 1
                if reaction.count <= 0 {
                    reactions.remove(at: index)
                } else {
                    reactions[index] = reaction
                }
            } else {
                reaction.users.append("current")
                reaction.count += 1
                reactions[index] = reaction
            }
        } else {
            reactions.append(Reaction(emoji: emoji, users: ["current"], count: 1))
        }

        withAnimation(.easeInOut(duration: 0.2)) {
            reactionStore[message.id] = reactions
        }
    }
}

// MARK: - Message Bubble

struct MessageBubbleView: View {
    let message: Message
    let isCurrentUser: Bool
    var reactions: [Reaction] = []
    var onThread: (() -> Void)?
    var onReply: (() -> Void)?
    var onReact: (() -> Void)?
    var onToggleReaction: ((String) -> Void)?
    @EnvironmentObject var theme: ThemeManager

    // Swipe state
    @State private var swipeOffset: CGFloat = 0
    @State private var swipeTriggered = false
    @State private var swipeDirection: SwipeAction = .none

    private enum SwipeAction { case none, reply, react }
    private let swipeThreshold: CGFloat = 60
    private let maxSwipe: CGFloat = 80

    private var user: User { MockData.user(by: message.userId) }

    var body: some View {
        ZStack {
            // Leading icon — Reply (swipe right)
            HStack {
                swipeIcon(systemName: "arrowshape.turn.up.left.fill",
                          color: Color(hex: "6C63FF"),
                          active: swipeDirection == .reply && swipeTriggered)
                    .opacity(swipeOffset > 10 ? 1 : 0)
                    .offset(x: min(swipeOffset - 44, 0))
                Spacer()
            }
            .padding(.leading, 12)

            // Trailing icon — React (swipe left)
            HStack {
                Spacer()
                swipeIcon(systemName: "face.smiling.fill",
                          color: .orange,
                          active: swipeDirection == .react && swipeTriggered)
                    .opacity(swipeOffset < -10 ? 1 : 0)
                    .offset(x: max(swipeOffset + 44, 0))
            }
            .padding(.trailing, 12)

            // Message content
            messageBubbleContent
                .offset(x: swipeOffset)
                .gesture(
                    DragGesture(minimumDistance: 16)
                        .onChanged { value in
                            let h = value.translation.width
                            let v = value.translation.height
                            // Only process horizontal drags
                            guard abs(h) > abs(v) else { return }

                            if h > 0 {
                                swipeDirection = .reply
                                swipeOffset = min(h, maxSwipe)
                            } else {
                                swipeDirection = .react
                                swipeOffset = max(h, -maxSwipe)
                            }

                            let pastThreshold = abs(swipeOffset) >= swipeThreshold
                            if pastThreshold != swipeTriggered {
                                swipeTriggered = pastThreshold
                                if pastThreshold {
                                    let generator = UIImpactFeedbackGenerator(style: .medium)
                                    generator.impactOccurred()
                                }
                            }
                        }
                        .onEnded { _ in
                            if swipeTriggered {
                                switch swipeDirection {
                                case .reply: onReply?()
                                case .react: onReact?()
                                case .none: break
                                }
                            }
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                swipeOffset = 0
                                swipeTriggered = false
                                swipeDirection = .none
                            }
                        }
                )
        }
    }

    @ViewBuilder
    private func swipeIcon(systemName: String, color: Color, active: Bool) -> some View {
        Image(systemName: systemName)
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(.white)
            .frame(width: 32, height: 32)
            .background(
                Circle().fill(active ? color : color.opacity(0.5))
            )
            .scaleEffect(active ? 1.15 : 0.85)
            .animation(.spring(response: 0.25, dampingFraction: 0.6), value: active)
    }

    private var messageBubbleContent: some View {
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
                        Text(message.timestamp.messageTimeString)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                        if message.isPinned {
                            Image(systemName: "pin.fill")
                                .font(.system(size: 9))
                                .foregroundStyle(.orange)
                        }
                    }
                }

                // Glass bubble
                Text(message.content)
                    .font(.subheadline)
                    .foregroundStyle(isCurrentUser ? .white : .primary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background {
                        if isCurrentUser {
                            RoundedRectangle(cornerRadius: 18)
                                .fill(
                                    LinearGradient(
                                        colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6")],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .overlay {
                                    RoundedRectangle(cornerRadius: 18)
                                        .strokeBorder(.white.opacity(0.2), lineWidth: 0.5)
                                }
                                .shadow(color: Color(hex: "6C63FF").opacity(0.3), radius: 8, y: 3)
                        } else {
                            RoundedRectangle(cornerRadius: 18)
                                .fill(.ultraThinMaterial)
                                .overlay {
                                    RoundedRectangle(cornerRadius: 18)
                                        .strokeBorder(theme.glassBorder.opacity(0.5), lineWidth: 0.5)
                                }
                                .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
                        }
                    }
                    .contextMenu {
                        Button { onReply?() } label: { Label("Reply", systemImage: "arrowshape.turn.up.left") }
                        Button { onReact?() } label: { Label("React", systemImage: "face.smiling") }
                        Button { onThread?() } label: { Label("Reply in Thread", systemImage: "text.bubble") }
                        Button { } label: { Label("Copy", systemImage: "doc.on.doc") }
                        Button { } label: { Label(message.isPinned ? "Unpin" : "Pin", systemImage: message.isPinned ? "pin.slash" : "pin") }
                    }

                if isCurrentUser {
                    Text(message.timestamp.messageTimeString)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }

                // Reactions
                if !reactions.isEmpty {
                    ReactionBar(
                        reactions: reactions,
                        onToggle: { emoji in onToggleReaction?(emoji) },
                        onAddMore: { onReact?() }
                    )
                }

                // Thread
                if !message.threadReplies.isEmpty {
                    Button { onThread?() } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "arrowshape.turn.up.left.fill").font(.caption2)
                            Text("\(message.threadReplies.count) replies").font(.caption).fontWeight(.medium)
                        }
                        .foregroundStyle(Color(hex: "6C63FF"))
                    }
                }

                // Image grid
                let images = message.attachments.filter { $0.type == .image }
                if !images.isEmpty {
                    let columns = images.count == 1 ? 1 : (images.count == 2 ? 2 : 3)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: columns), spacing: 4) {
                        ForEach(images) { img in
                            ImageAttachmentCard(attachment: img)
                        }
                    }
                    .frame(maxWidth: 260)
                }

                // Other attachments
                ForEach(message.attachments.filter { $0.type != .image }) { attachment in
                    AttachmentPreview(attachment: attachment)
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 4)
        .frame(maxWidth: .infinity, alignment: isCurrentUser ? .trailing : .leading)
    }
}

// MARK: - Reaction Bar

struct ReactionBar: View {
    let reactions: [Reaction]
    let onToggle: (String) -> Void
    let onAddMore: () -> Void
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 4) {
            ForEach(reactions) { reaction in
                Button { onToggle(reaction.emoji) } label: {
                    HStack(spacing: 3) {
                        Text(reaction.emoji).font(.caption)
                        Text("\(reaction.count)")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundStyle(reaction.users.contains("current") ? Color(hex: "6C63FF") : .secondary)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background {
                        if reaction.users.contains("current") {
                            Capsule().fill(Color(hex: "6C63FF").opacity(0.12))
                        } else {
                            Capsule().fill(.ultraThinMaterial)
                        }
                    }
                    .overlay {
                        Capsule().strokeBorder(
                            reaction.users.contains("current")
                                ? Color(hex: "6C63FF").opacity(0.4)
                                : theme.glassBorder.opacity(0.3),
                            lineWidth: 0.5
                        )
                    }
                }
                .buttonStyle(.plain)
            }

            // Add reaction button
            Button(action: onAddMore) {
                Image(systemName: "plus")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundStyle(.secondary)
                    .frame(width: 26, height: 26)
                    .background(.ultraThinMaterial, in: Circle())
                    .overlay { Circle().strokeBorder(theme.glassBorder.opacity(0.3), lineWidth: 0.5) }
            }
            .buttonStyle(.plain)
        }
    }
}

// MARK: - Emoji Picker Sheet

struct EmojiPickerSheet: View {
    let existingReactions: [Reaction]
    let onSelect: (String) -> Void
    @EnvironmentObject var theme: ThemeManager
    @State private var searchText = ""
    @State private var selectedCategory: EmojiCategory = .people
    @State private var recentTab: RecentTab = .recent
    @AppStorage("recentEmojis") private var recentEmojisData: String = ""
    @AppStorage("frequentEmojis") private var frequentEmojisData: String = ""
    @State private var selectedSkinTone: Int = 0

    enum RecentTab: String { case recent = "Recent", frequent = "Frequent" }

    private let skinToneModifiers = ["", "🏻", "🏼", "🏽", "🏾", "🏿"]
    private let skinToneSamples = ["👍", "👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"]

    private var recentEmojis: [String] {
        recentEmojisData.isEmpty ? [] : recentEmojisData.components(separatedBy: ",").filter { !$0.isEmpty }
    }

    private var frequentEmojis: [String] {
        // Stored as "emoji:count,emoji:count,..."
        guard !frequentEmojisData.isEmpty else { return [] }
        return frequentEmojisData.components(separatedBy: ",")
            .compactMap { entry -> (String, Int)? in
                let parts = entry.components(separatedBy: ":")
                guard parts.count == 2, let count = Int(parts[1]) else { return nil }
                return (parts[0], count)
            }
            .sorted { $0.1 > $1.1 }
            .prefix(12)
            .map(\.0)
    }

    private var searchResults: [String] {
        guard !searchText.isEmpty else { return [] }
        let query = searchText.lowercased()
        return EmojiCategory.allCases.flatMap { $0.emojis }
            .filter { emoji in
                EmojiData.keywords[emoji]?.contains(where: { $0.contains(query) }) ?? false
            }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                MeshBackgroundView()

                VStack(spacing: 0) {
                    // Search bar
                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.secondary).font(.subheadline)
                        TextField("Search emoji...", text: $searchText)
                            .font(.subheadline).autocorrectionDisabled()
                        if !searchText.isEmpty {
                            Button { searchText = "" } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(.secondary).font(.subheadline)
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 9)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .overlay {
                        RoundedRectangle(cornerRadius: 12)
                            .strokeBorder(theme.glassBorder.opacity(0.5), lineWidth: 0.5)
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    // Skin tone selector
                    HStack(spacing: 6) {
                        ForEach(0..<6, id: \.self) { index in
                            Button {
                                withAnimation(.easeInOut(duration: 0.15)) { selectedSkinTone = index }
                            } label: {
                                Text(skinToneSamples[index])
                                    .font(.title3)
                                    .frame(width: 36, height: 36)
                                    .background {
                                        if selectedSkinTone == index {
                                            RoundedRectangle(cornerRadius: 8)
                                                .fill(Color(hex: "6C63FF").opacity(0.15))
                                        }
                                    }
                                    .overlay {
                                        if selectedSkinTone == index {
                                            RoundedRectangle(cornerRadius: 8)
                                                .strokeBorder(Color(hex: "6C63FF").opacity(0.4), lineWidth: 1)
                                        }
                                    }
                            }
                            .buttonStyle(.plain)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    Divider().opacity(0.3).padding(.vertical, 6)

                    if !searchText.isEmpty {
                        // Search results
                        searchResultsView
                    } else {
                        // Recent / Frequent + Category tabs + Grid
                        ScrollView {
                            VStack(spacing: 12) {
                                recentFrequentSection
                                Divider().opacity(0.3).padding(.horizontal)
                                categoryTabsView
                                categoryGridView
                            }
                            .padding(.bottom, 16)
                        }
                    }
                }
            }
            .navigationTitle("React")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Search Results

    private var searchResultsView: some View {
        ScrollView {
            if searchResults.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.title).foregroundStyle(.tertiary)
                    Text("No results")
                        .font(.subheadline).foregroundStyle(.secondary)
                }
                .padding(.top, 60)
            } else {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 8), spacing: 6) {
                    ForEach(searchResults, id: \.self) { emoji in
                        emojiButton(emoji)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)
            }
        }
    }

    // MARK: - Recent / Frequent

    private var recentFrequentSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                ForEach([RecentTab.recent, .frequent], id: \.rawValue) { tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) { recentTab = tab }
                    } label: {
                        Text(tab.rawValue)
                            .font(.caption)
                            .fontWeight(recentTab == tab ? .semibold : .regular)
                            .foregroundStyle(recentTab == tab ? .primary : .secondary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 5)
                            .background {
                                if recentTab == tab {
                                    Capsule().fill(.ultraThinMaterial)
                                        .overlay { Capsule().strokeBorder(theme.glassBorder.opacity(0.4), lineWidth: 0.5) }
                                }
                            }
                    }
                    .buttonStyle(.plain)
                }
                Spacer()
            }
            .padding(.horizontal)

            let emojis = recentTab == .recent ? recentEmojis : frequentEmojis
            if emojis.isEmpty {
                Text(recentTab == .recent ? "No recent emojis" : "No frequent emojis")
                    .font(.caption).foregroundStyle(.tertiary)
                    .frame(maxWidth: .infinity).padding(.vertical, 12)
            } else {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 6), spacing: 6) {
                    ForEach(emojis.prefix(12), id: \.self) { emoji in
                        emojiButton(emoji)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Category Tabs

    private var categoryTabsView: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 4) {
                ForEach(EmojiCategory.allCases, id: \.self) { category in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) { selectedCategory = category }
                    } label: {
                        HStack(spacing: 4) {
                            Text(category.icon)
                                .font(.caption)
                            Text(category.rawValue)
                                .font(.caption2)
                                .fontWeight(selectedCategory == category ? .semibold : .regular)
                        }
                        .foregroundStyle(selectedCategory == category ? Color(hex: "6C63FF") : .secondary)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background {
                            if selectedCategory == category {
                                Capsule().fill(Color(hex: "6C63FF").opacity(0.1))
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Category Grid

    private var categoryGridView: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 8), spacing: 6) {
            ForEach(selectedCategory.emojis, id: \.self) { emoji in
                emojiButton(applySkinTone(emoji))
            }
        }
        .padding(.horizontal)
        .animation(.easeInOut(duration: 0.2), value: selectedCategory)
    }

    // MARK: - Emoji Button

    private func emojiButton(_ emoji: String) -> some View {
        let isActive = existingReactions.contains { $0.emoji == emoji && $0.users.contains("current") }
        return Button {
            trackEmoji(emoji)
            onSelect(emoji)
        } label: {
            Text(emoji)
                .font(.title2)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 3)
                .background {
                    if isActive {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(hex: "6C63FF").opacity(0.12))
                    }
                }
        }
        .buttonStyle(.plain)
    }

    // MARK: - Skin Tone

    private func applySkinTone(_ emoji: String) -> String {
        guard selectedSkinTone > 0, EmojiData.skinToneSupported.contains(emoji) else { return emoji }
        return emoji + skinToneModifiers[selectedSkinTone]
    }

    // MARK: - Tracking

    private func trackEmoji(_ emoji: String) {
        // Update recent
        var recent = recentEmojis
        recent.removeAll { $0 == emoji }
        recent.insert(emoji, at: 0)
        recentEmojisData = recent.prefix(12).joined(separator: ",")

        // Update frequent
        var freq: [String: Int] = [:]
        if !frequentEmojisData.isEmpty {
            for entry in frequentEmojisData.components(separatedBy: ",") {
                let parts = entry.components(separatedBy: ":")
                if parts.count == 2, let count = Int(parts[1]) { freq[parts[0]] = count }
            }
        }
        freq[emoji, default: 0] += 1
        frequentEmojisData = freq.map { "\($0.key):\($0.value)" }.joined(separator: ",")
    }
}

// MARK: - Emoji Categories

enum EmojiCategory: String, CaseIterable {
    case people = "People"
    case nature = "Nature"
    case foods = "Foods"
    case activity = "Activity"
    case places = "Places"
    case objects = "Objects"
    case symbols = "Symbols"
    case flags = "Flags"

    var icon: String {
        switch self {
        case .people:   return "🙂"
        case .nature:   return "🌿"
        case .foods:    return "🍔"
        case .activity: return "⚽"
        case .places:   return "🌍"
        case .objects:  return "📦"
        case .symbols:  return "❤️"
        case .flags:    return "🏳️"
        }
    }

    var emojis: [String] {
        switch self {
        case .people:
            return ["😀", "😃", "😄", "😁", "😆", "🥹", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🫢", "🤫", "🤔", "😐", "😑", "😶", "🫡", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖",
                     "👍", "👎", "👏", "🙌", "🤝", "✊", "👊", "🤞", "✌️", "🤟", "🫶", "💪", "👋", "🖐️", "✋", "👌", "🤌", "🤏", "🫳", "🫴", "👈", "👉", "👆", "👇", "☝️", "🫵", "🤚", "🖖"]
        case .nature:
            return ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪲", "🪳", "🦟", "🦗",
                     "🌸", "💮", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🪹", "🪺",
                     "🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌞", "⭐", "🌟", "💫", "✨", "☀️", "🌤️", "⛅", "🌥️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "🌈", "🔥", "💧", "🌊"]
        case .foods:
            return ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🍆", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠",
                     "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗",
                     "🍿", "🧈", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡",
                     "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯",
                     "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🫗", "🥤", "🧋", "🧃", "🧉"]
        case .activity:
            return ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂",
                     "🏋️", "🤸", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚴", "🚵",
                     "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🪗", "🎸", "🎻",
                     "🎲", "♟️", "🎯", "🎳", "🎮", "🕹️", "🧩", "🪄", "🎰"]
        case .places:
            return ["🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋",
                     "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️", "🛺", "🚲", "🛴", "🚏", "🛣️", "🛤️",
                     "✈️", "🛫", "🛬", "🪂", "💺", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢"]
        case .objects:
            return ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💾", "💿", "📀", "📼",
                     "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️",
                     "🔋", "🪫", "🔌", "💡", "🔦", "🕯️", "🧯", "🛢️", "💰", "🪙", "💴", "💵", "💶", "💷", "💸", "💳",
                     "📦", "📫", "📪", "📬", "📭", "📮", "🗳️", "✏️", "✒️", "🖋️", "🖊️", "🖌️", "🖍️", "📝", "📁", "📂", "🗂️", "📅", "📆", "📇", "📈", "📉", "📊",
                     "🔑", "🗝️", "🔒", "🔓", "🔏", "🔐", "🔨", "🪓", "⛏️", "⚒️", "🛠️", "🗡️", "⚔️", "🔫", "🪃", "🏹", "🛡️", "🪚", "🔧", "🪛", "🔩", "⚙️", "🗜️", "🧲"]
        case .symbols:
            return ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
                     "✅", "❌", "⭕", "❗", "❓", "‼️", "⁉️", "💯", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪",
                     "♻️", "⚠️", "🚫", "📵", "🔞", "☢️", "☣️", "⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", "↔️", "↩️", "↪️", "⤴️", "⤵️", "🔃", "🔄",
                     "🔀", "🔁", "🔂", "▶️", "⏩", "⏭️", "⏯️", "◀️", "⏪", "⏮️", "🔼", "⏫", "🔽", "⏬", "⏸️", "⏹️", "⏺️",
                     "⚡", "🔥", "💫", "✨", "🌟", "⭐", "💥", "💢", "💤", "💨", "🕊️", "🔔", "🔕", "📣", "📢"]
        case .flags:
            return ["🏳️", "🏴", "🏁", "🚩", "🎌", "🏴‍☠️",
                     "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇯🇵", "🇰🇷", "🇨🇳", "🇹🇼", "🇮🇳", "🇧🇷", "🇲🇽", "🇪🇸", "🇮🇹", "🇷🇺", "🇳🇱", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮", "🇨🇭", "🇦🇹", "🇧🇪", "🇵🇱", "🇮🇪", "🇵🇹", "🇬🇷", "🇹🇷", "🇮🇱", "🇸🇦", "🇦🇪", "🇪🇬", "🇿🇦", "🇳🇬", "🇰🇪", "🇦🇷", "🇨🇱", "🇨🇴", "🇵🇪", "🇻🇪", "🇹🇭", "🇻🇳", "🇮🇩", "🇲🇾", "🇸🇬", "🇵🇭", "🇳🇿"]
        }
    }
}

// MARK: - Emoji Data (Keywords & Skin Tone)

enum EmojiData {
    static let skinToneSupported: Set<String> = [
        "👍", "👎", "👏", "🙌", "🤝", "✊", "👊", "🤞", "✌️", "🤟", "🫶", "💪", "👋", "🖐️", "✋", "👌", "🤌", "🤏", "🫳", "🫴", "👈", "👉", "👆", "👇", "☝️", "🫵", "🤚", "🖖",
        "🏋️", "🤸", "🤾", "🏌️", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚴", "🚵"
    ]

    static let keywords: [String: [String]] = {
        var map: [String: [String]] = [:]
        let entries: [(String, [String])] = [
            ("😀", ["grinning", "happy", "smile"]), ("😃", ["smiley", "happy"]), ("😄", ["smile", "happy"]),
            ("😁", ["grin", "happy"]), ("😆", ["laughing", "happy"]), ("😅", ["sweat", "smile"]),
            ("🤣", ["rofl", "laugh"]), ("😂", ["joy", "laugh", "tears"]), ("🙂", ["slight", "smile"]),
            ("😊", ["blush", "smile"]), ("😇", ["angel", "innocent"]), ("🥰", ["love", "hearts"]),
            ("😍", ["heart eyes", "love"]), ("🤩", ["star", "eyes", "excited"]), ("😘", ["kiss", "love"]),
            ("😋", ["yummy", "delicious"]), ("😛", ["tongue"]), ("😜", ["wink", "tongue"]),
            ("🤪", ["crazy", "zany"]), ("🤗", ["hug", "hugging"]), ("🤔", ["thinking", "hmm"]),
            ("😏", ["smirk"]), ("😒", ["unamused"]), ("🙄", ["eye roll"]),
            ("😬", ["grimace"]), ("😌", ["relieved"]), ("😔", ["pensive", "sad"]),
            ("😴", ["sleeping", "zzz"]), ("🤯", ["mind blown", "exploding"]),
            ("🥳", ["party", "celebrate"]), ("😎", ["cool", "sunglasses"]),
            ("😕", ["confused"]), ("😟", ["worried"]), ("😮", ["surprised", "open mouth"]),
            ("😲", ["astonished"]), ("😳", ["flushed"]), ("🥺", ["pleading", "puppy"]),
            ("😢", ["crying", "sad"]), ("😭", ["sobbing", "cry"]), ("😱", ["scream", "fear"]),
            ("😤", ["angry", "huff"]), ("😡", ["rage", "angry"]), ("😠", ["angry"]),
            ("💀", ["skull", "dead"]), ("💩", ["poop"]), ("👻", ["ghost"]),
            ("👍", ["thumbsup", "yes", "like", "ok", "good"]), ("👎", ["thumbsdown", "no", "bad"]),
            ("👏", ["clap", "applause"]), ("🙌", ["raise", "hands", "hooray"]),
            ("🤝", ["handshake"]), ("✊", ["fist"]), ("👊", ["punch"]),
            ("🤞", ["fingers crossed", "luck"]), ("✌️", ["peace", "victory"]),
            ("💪", ["muscle", "strong"]), ("👋", ["wave", "hi", "hello", "bye"]),
            ("❤️", ["heart", "love", "red"]), ("🧡", ["orange", "heart"]),
            ("💛", ["yellow", "heart"]), ("💚", ["green", "heart"]),
            ("💙", ["blue", "heart"]), ("💜", ["purple", "heart"]),
            ("🖤", ["black", "heart"]), ("🤍", ["white", "heart"]),
            ("💔", ["broken", "heart"]), ("❤️‍🔥", ["fire", "heart"]),
            ("🔥", ["fire", "hot", "lit"]), ("⭐", ["star"]),
            ("🎉", ["party", "celebrate", "tada"]), ("🎊", ["confetti"]),
            ("💡", ["idea", "lightbulb"]), ("💎", ["diamond", "gem"]),
            ("🏆", ["trophy", "winner"]), ("🚀", ["rocket", "launch"]),
            ("💯", ["hundred", "perfect"]), ("✅", ["check", "yes", "done"]),
            ("❌", ["cross", "no", "wrong"]), ("⚡", ["lightning", "zap"]),
            ("🔔", ["bell", "notification"]), ("📌", ["pin"]),
            ("🎯", ["target", "bullseye"]), ("😮", ["wow", "surprised"]),
            ("😢", ["sad", "cry"]),
        ]
        for (emoji, words) in entries { map[emoji] = words }
        return map
    }()
}

// MARK: - Attachment Preview

struct AttachmentPreview: View {
    let attachment: MessageAttachment
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        Group {
            switch attachment.type {
            case .image:
                ImageAttachmentCard(attachment: attachment)
            case .video:
                VideoAttachmentCard(attachment: attachment)
            case .document:
                DocumentAttachmentCard(attachment: attachment)
            case .task:
                TaskAttachmentCard(attachment: attachment)
            case .file:
                FileAttachmentCard(attachment: attachment)
            }
        }
        .frame(maxWidth: 260)
    }
}

// MARK: - Image Attachment

struct ImageAttachmentCard: View {
    let attachment: MessageAttachment

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [Color.purple.opacity(0.3), Color.blue.opacity(0.2)],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
                .frame(height: 140)
                .overlay {
                    Image(systemName: "photo.fill")
                        .font(.system(size: 32))
                        .foregroundStyle(.white.opacity(0.4))
                }
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(.white.opacity(0.15), lineWidth: 0.5)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(attachment.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(.white)
                    .lineLimit(1)
                if let size = attachment.size {
                    Text(size)
                        .font(.system(size: 10))
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(colors: [.clear, .black.opacity(0.5)], startPoint: .top, endPoint: .bottom)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            )
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Video Attachment

struct VideoAttachmentCard: View {
    let attachment: MessageAttachment

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [Color.pink.opacity(0.3), Color.purple.opacity(0.2)],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
                .frame(height: 140)
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(.white.opacity(0.15), lineWidth: 0.5)
                }

            // Play button
            Circle()
                .fill(.ultraThinMaterial)
                .frame(width: 44, height: 44)
                .overlay {
                    Image(systemName: "play.fill")
                        .font(.body)
                        .foregroundStyle(.white)
                        .offset(x: 2)
                }

            // Duration badge
            if let duration = attachment.videoDuration {
                VStack {
                    HStack {
                        Spacer()
                        Text(duration)
                            .font(.system(size: 10, design: .monospaced))
                            .fontWeight(.medium)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(.black.opacity(0.5), in: RoundedRectangle(cornerRadius: 4))
                    }
                    Spacer()
                }
                .padding(8)
            }

            // Bottom info
            VStack {
                Spacer()
                HStack(spacing: 6) {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(attachment.name)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundStyle(.white)
                            .lineLimit(1)
                        HStack(spacing: 6) {
                            if let size = attachment.size {
                                Text(size).font(.system(size: 10)).foregroundStyle(.white.opacity(0.7))
                            }
                            if let mime = attachment.mimeType {
                                Text(mime.split(separator: "/").last.map(String.init) ?? "")
                                    .font(.system(size: 10))
                                    .foregroundStyle(.white.opacity(0.7))
                                    .textCase(.uppercase)
                            }
                        }
                    }
                    Spacer()
                }
                .padding(10)
                .background(
                    LinearGradient(colors: [.clear, .black.opacity(0.5)], startPoint: .top, endPoint: .bottom)
                )
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Document Attachment

struct DocumentAttachmentCard: View {
    let attachment: MessageAttachment

    var body: some View {
        HStack(spacing: 10) {
            Text(attachment.docEmoji ?? "📄")
                .font(.title2)

            VStack(alignment: .leading, spacing: 3) {
                Text(attachment.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    if let author = attachment.docAuthor {
                        Text(author)
                            .font(.system(size: 10))
                            .foregroundStyle(.secondary)
                    }
                    if let modified = attachment.docLastModified {
                        Text(modified.shortDateString)
                            .font(.system(size: 10))
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(10)
        .glassCard(cornerRadius: 12)
    }
}

// MARK: - Task Attachment

struct TaskAttachmentCard: View {
    let attachment: MessageAttachment

    private var statusConfig: (icon: String, color: Color, label: String) {
        switch attachment.taskStatus?.lowercased() {
        case "in-progress", "in progress": return ("bolt.fill", .orange, "In Progress")
        case "in-review", "in review":     return ("eye.fill", .purple, "In Review")
        case "done":                       return ("checkmark.circle.fill", .green, "Done")
        case "backlog":                    return ("clock.fill", .gray, "Backlog")
        default:                           return ("circle.dotted", .blue, "To Do")
        }
    }

    private var priorityConfig: (color: Color, label: String) {
        switch attachment.taskPriority?.lowercased() {
        case "critical": return (.red, "Critical")
        case "high":     return (.orange, "High")
        case "low":      return (.green, "Low")
        default:         return (.yellow, "Medium")
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Task ID + Status
            HStack(spacing: 6) {
                if let taskId = attachment.taskId {
                    Text(taskId)
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                HStack(spacing: 3) {
                    Image(systemName: statusConfig.icon)
                        .font(.system(size: 9))
                    Text(statusConfig.label)
                        .font(.system(size: 10))
                        .fontWeight(.semibold)
                }
                .foregroundStyle(statusConfig.color)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(statusConfig.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 4))
            }

            // Task name
            Text(attachment.name)
                .font(.caption)
                .fontWeight(.medium)
                .lineLimit(2)

            // Priority + Assignee
            HStack(spacing: 8) {
                HStack(spacing: 3) {
                    if attachment.taskPriority == "critical" {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 9))
                    }
                    Text(priorityConfig.label)
                        .font(.system(size: 10))
                        .fontWeight(.semibold)
                }
                .foregroundStyle(priorityConfig.color)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(priorityConfig.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 4))

                if let assignee = attachment.taskAssignee {
                    HStack(spacing: 3) {
                        Image(systemName: "person.fill")
                            .font(.system(size: 8))
                        Text(assignee)
                            .font(.system(size: 10))
                    }
                    .foregroundStyle(.secondary)
                }
            }
        }
        .padding(10)
        .glassCard(cornerRadius: 12)
    }
}

// MARK: - File Attachment

struct FileAttachmentCard: View {
    let attachment: MessageAttachment

    private var fileConfig: (icon: String, color: Color) {
        let ext = attachment.name.split(separator: ".").last.map(String.init)?.lowercased() ?? ""
        switch ext {
        case "pdf":                    return ("doc.richtext.fill", .red)
        case "doc", "docx":            return ("doc.text.fill", .blue)
        case "xls", "xlsx", "csv":     return ("tablecells.fill", .green)
        case "ppt", "pptx":            return ("play.rectangle.fill", .orange)
        case "zip", "tar", "gz":       return ("archivebox.fill", .gray)
        case "js", "ts", "py", "swift": return ("chevron.left.forwardslash.chevron.right", .teal)
        default:                        return ("doc.fill", .blue)
        }
    }

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: fileConfig.icon)
                .font(.title3)
                .foregroundStyle(fileConfig.color)
                .frame(width: 36, height: 36)
                .background(fileConfig.color.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
                .overlay {
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(fileConfig.color.opacity(0.2), lineWidth: 0.5)
                }

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
        .glassCard(cornerRadius: 12)
    }
}

// MARK: - Message Input

struct MessageInputBar: View {
    @Binding var text: String
    @Binding var replyingTo: Message?
    var onEmoji: (() -> Void)?
    let onSend: () -> Void
    @EnvironmentObject var theme: ThemeManager
    @FocusState private var isFocused: Bool
    @State private var showAttachmentMenu = false
    @State private var showFormatting = false

    init(text: Binding<String>, replyingTo: Binding<Message?> = .constant(nil), onEmoji: (() -> Void)? = nil, onSend: @escaping () -> Void) {
        self._text = text
        self._replyingTo = replyingTo
        self.onEmoji = onEmoji
        self.onSend = onSend
    }

    private var hasText: Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        VStack(spacing: 0) {
            Divider().opacity(0.2)

            // Reply preview
            if let reply = replyingTo {
                ReplyPreviewBar(message: reply) {
                    withAnimation(.easeInOut(duration: 0.2)) { replyingTo = nil }
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Formatting toolbar (visible when toggled)
            if showFormatting {
                FormattingToolbar(text: $text)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Main input row
            HStack(alignment: .bottom, spacing: 8) {
                // Attachment button
                Button { showAttachmentMenu = true } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.secondary)
                }

                // Text field with inline buttons
                HStack(alignment: .bottom, spacing: 6) {
                    TextField("Type a message...", text: $text, axis: .vertical)
                        .font(.subheadline)
                        .lineLimit(1...5)
                        .focused($isFocused)

                    // Formatting toggle
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) { showFormatting.toggle() }
                    } label: {
                        Image(systemName: "textformat")
                            .font(.subheadline)
                            .foregroundStyle(showFormatting ? Color(hex: "6C63FF") : .secondary)
                    }

                    // Emoji
                    Button { onEmoji?() } label: {
                        Image(systemName: "face.smiling")
                            .font(.subheadline)
                            .foregroundStyle(onEmoji != nil ? Color(hex: "6C63FF").opacity(0.7) : .secondary)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 22))
                .overlay {
                    RoundedRectangle(cornerRadius: 22)
                        .strokeBorder(theme.glassBorder.opacity(0.4), lineWidth: 0.5)
                }

                // Send button
                Button(action: onSend) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(hasText ? Color(hex: "6C63FF") : .secondary)
                        .shadow(color: hasText ? Color(hex: "6C63FF").opacity(0.3) : .clear, radius: 4)
                }
                .disabled(!hasText)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.ultraThinMaterial)
        }
        .confirmationDialog("Attach", isPresented: $showAttachmentMenu) {
            Button { } label: { Label("Photo Library", systemImage: "photo.on.rectangle") }
            Button { } label: { Label("Camera", systemImage: "camera") }
            Button { } label: { Label("File", systemImage: "doc") }
            Button("Cancel", role: .cancel) { }
        }
    }
}

// MARK: - Reply Preview Bar

private struct ReplyPreviewBar: View {
    let message: Message
    let onDismiss: () -> Void
    @EnvironmentObject var theme: ThemeManager

    private var user: User { MockData.user(by: message.userId) }

    var body: some View {
        HStack(spacing: 10) {
            // Accent bar
            RoundedRectangle(cornerRadius: 2)
                .fill(Color(hex: "6C63FF"))
                .frame(width: 3, height: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(message.userId == "current" ? "You" : user.name)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color(hex: "6C63FF"))
                Text(message.content)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            Button(action: onDismiss) {
                Image(systemName: "xmark.circle.fill")
                    .font(.subheadline)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
    }
}

// MARK: - Formatting Toolbar

private struct FormattingToolbar: View {
    @Binding var text: String
    @EnvironmentObject var theme: ThemeManager

    private let formatActions: [(icon: String, label: String, prefix: String, suffix: String)] = [
        ("bold", "Bold", "**", "**"),
        ("italic", "Italic", "_", "_"),
        ("strikethrough", "Strikethrough", "~~", "~~"),
        ("chevron.left.forwardslash.chevron.right", "Code", "`", "`"),
        ("list.bullet", "List", "\n- ", ""),
        ("list.number", "Numbered", "\n1. ", ""),
        ("text.quote", "Quote", "\n> ", ""),
        ("link", "Link", "[", "](url)"),
    ]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 2) {
                ForEach(formatActions, id: \.label) { action in
                    Button {
                        applyFormat(prefix: action.prefix, suffix: action.suffix)
                    } label: {
                        Image(systemName: action.icon)
                            .font(.system(size: 14))
                            .foregroundStyle(.secondary)
                            .frame(width: 36, height: 32)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 12)
        }
        .padding(.vertical, 4)
        .background(.ultraThinMaterial)
    }

    private func applyFormat(prefix: String, suffix: String) {
        text += prefix + (suffix.isEmpty ? "" : "text" + suffix)
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
            ZStack {
                MeshBackgroundView()

                VStack(spacing: 0) {
                    ScrollView {
                        VStack(spacing: 0) {
                            MessageBubbleView(message: parentMessage, isCurrentUser: parentMessage.userId == "current", reactions: parentMessage.reactions)
                                .padding(.bottom, 8)
                            Divider().opacity(0.3).padding(.horizontal)
                            if parentMessage.threadReplies.isEmpty {
                                EmptyStateView(icon: "bubble.left.and.bubble.right", title: "No replies yet", subtitle: "Start a thread conversation")
                            } else {
                                ForEach(parentMessage.threadReplies) { reply in
                                    MessageBubbleView(message: reply, isCurrentUser: reply.userId == "current", reactions: reply.reactions)
                                }
                            }
                        }
                        .padding(.vertical, 8)
                    }
                    MessageInputBar(text: $replyText) { }
                }
            }
            .navigationTitle("Thread")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { Button("Done") { dismiss() } }
            }
        }
    }
}

extension Message: @retroactive Hashable {
    static func == (lhs: Message, rhs: Message) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
