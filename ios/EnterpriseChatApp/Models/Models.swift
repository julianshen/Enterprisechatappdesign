import SwiftUI

// MARK: - User

struct User: Identifiable, Hashable {
    let id: String
    let name: String
    let avatar: String
    var status: UserStatus
    var title: String?
    var department: String?
    var email: String?
    var phone: String?
    var timezone: String?
}

enum UserStatus: String, CaseIterable {
    case online, away, busy, offline

    var color: Color {
        switch self {
        case .online: return Color(hex: "34C759")
        case .away: return Color(hex: "FF9500")
        case .busy: return Color(hex: "FF3B30")
        case .offline: return Color(hex: "8E8E93")
        }
    }

    var label: String {
        rawValue.capitalized
    }
}

// MARK: - Message

struct Message: Identifiable {
    let id: String
    let userId: String
    let content: String
    let timestamp: Date
    var reactions: [Reaction]
    var isPinned: Bool
    var isEdited: Bool
    var attachments: [MessageAttachment]
    var threadReplies: [Message]
    var seenBy: [String]

    init(id: String, userId: String, content: String, timestamp: Date,
         reactions: [Reaction] = [], isPinned: Bool = false, isEdited: Bool = false,
         attachments: [MessageAttachment] = [], threadReplies: [Message] = [],
         seenBy: [String] = []) {
        self.id = id
        self.userId = userId
        self.content = content
        self.timestamp = timestamp
        self.reactions = reactions
        self.isPinned = isPinned
        self.isEdited = isEdited
        self.attachments = attachments
        self.threadReplies = threadReplies
        self.seenBy = seenBy
    }
}

struct Reaction: Identifiable {
    let id = UUID().uuidString
    let emoji: String
    var users: [String]
    var count: Int
}

struct MessageAttachment: Identifiable {
    let id = UUID().uuidString
    let type: AttachmentType
    let name: String
    var size: String?
    var previewURL: String?
    var mimeType: String?
    // Document-specific
    var docEmoji: String?
    var docAuthor: String?
    var docLastModified: Date?
    // Task-specific
    var taskId: String?
    var taskStatus: String?
    var taskPriority: String?
    var taskAssignee: String?
    // Video-specific
    var videoDuration: String?
}

enum AttachmentType: String {
    case image, file, video, document, task
}

// MARK: - Chat

struct DirectMessage: Identifiable {
    let id: String
    let user: User
    var lastMessage: String
    var lastMessageTime: Date
    var unreadCount: Int
    var messages: [Message]
    var isPinned: Bool
}

struct GroupChat: Identifiable {
    let id: String
    let name: String
    let members: [User]
    var lastMessage: String
    var lastMessageTime: Date
    var unreadCount: Int
    var messages: [Message]
    var avatar: String?
    var isPinned: Bool
}

// MARK: - Space

struct Space: Identifiable, Hashable {
    let id: String
    let name: String
    let icon: String
    let color: String
    var description: String?
    var channels: [Channel]
    var members: [User]
    var dashboards: [SpaceDashboard]
    var isFavorite: Bool

    static func == (lhs: Space, rhs: Space) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

struct Channel: Identifiable, Hashable {
    let id: String
    let name: String
    let type: ChannelType
    var description: String?
    var unreadCount: Int
    var messages: [Message]
    var isPinned: Bool
    var lastActivity: Date?

    static func == (lhs: Channel, rhs: Channel) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

enum ChannelType: String {
    case text, announcement, privateChannel = "private"

    var icon: String {
        switch self {
        case .text: return "number"
        case .announcement: return "megaphone.fill"
        case .privateChannel: return "lock.fill"
        }
    }
}

// MARK: - File

struct FileItem: Identifiable {
    let id: String
    let name: String
    let type: FileType
    let size: String
    let uploadedBy: String
    let uploadedAt: Date
    var securityLevel: SecurityLevel
    var accessLevel: AccessLevel
    var isStarred: Bool
    var parentFolder: String?
    var previewURL: String?
}

enum FileType: String {
    case pdf, doc, xls, ppt, image, video, zip, folder, code, other

    var icon: String {
        switch self {
        case .pdf: return "doc.richtext.fill"
        case .doc: return "doc.text.fill"
        case .xls: return "tablecells.fill"
        case .ppt: return "play.rectangle.fill"
        case .image: return "photo.fill"
        case .video: return "film.fill"
        case .zip: return "archivebox.fill"
        case .folder: return "folder.fill"
        case .code: return "chevron.left.forwardslash.chevron.right"
        case .other: return "doc.fill"
        }
    }

    var color: Color {
        switch self {
        case .pdf: return .red
        case .doc: return .blue
        case .xls: return .green
        case .ppt: return .orange
        case .image: return .purple
        case .video: return .pink
        case .zip: return .gray
        case .folder: return Color(hex: "5B5FC7")
        case .code: return .teal
        case .other: return .secondary
        }
    }
}

enum SecurityLevel: String, CaseIterable {
    case a = "A"
    case b = "B"
    case c = "C"

    var color: Color {
        switch self {
        case .a: return .red
        case .b: return .orange
        case .c: return .green
        }
    }
}

enum AccessLevel: String, CaseIterable {
    case `public`, restricted, confidential

    var label: String { rawValue.capitalized }

    var icon: String {
        switch self {
        case .public: return "globe"
        case .restricted: return "person.2.fill"
        case .confidential: return "lock.shield.fill"
        }
    }
}

// MARK: - Document

struct Document: Identifiable {
    let id: String
    var title: String
    let createdBy: String
    let createdAt: Date
    var updatedAt: Date
    var blocks: [DocumentBlock]
    var securityLevel: SecurityLevel
    var accessLevel: AccessLevel
    var icon: String
    var coverImage: String?
    var isStarred: Bool
    var tags: [String]
}

struct DocumentBlock: Identifiable {
    let id: String
    var type: BlockType
    var content: String
    var metadata: BlockMetadata?
}

enum BlockType: String, CaseIterable {
    case heading1, heading2, heading3
    case paragraph, bullet, numbered, todo
    case callout, divider, code, quote
    case table, image
}

struct BlockMetadata {
    var isChecked: Bool?
    var language: String?
    var calloutColor: String?
    var calloutIcon: String?
    var imageURL: String?
    var tableData: [[String]]?
}

// MARK: - Dashboard

struct SpaceDashboard: Identifiable, Hashable {
    let id: String
    let name: String
    let icon: String
    var widgets: [DashboardWidget]

    static func == (lhs: SpaceDashboard, rhs: SpaceDashboard) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

struct DashboardWidget: Identifiable, Hashable {
    let id: String
    let type: WidgetType
    var title: String
    var data: WidgetData

    static func == (lhs: DashboardWidget, rhs: DashboardWidget) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

enum WidgetType: String {
    case metric, list, progress, members, links
}

struct WidgetData: Hashable {
    var value: String?
    var trend: String?
    var trendUp: Bool?
    var items: [WidgetItem]?
    var progress: Double?
    var progressColor: String?
    var members: [String]?
    var links: [WidgetLink]?

    static func == (lhs: WidgetData, rhs: WidgetData) -> Bool { lhs.value == rhs.value && lhs.trend == rhs.trend }
    func hash(into hasher: inout Hasher) { hasher.combine(value); hasher.combine(trend) }
}

struct WidgetItem: Identifiable, Hashable {
    let id = UUID().uuidString
    let label: String
    let status: String
    let statusColor: String
}

struct WidgetLink: Identifiable, Hashable {
    let id = UUID().uuidString
    let label: String
    let icon: String
    let url: String
}

// MARK: - Meeting

struct Meeting: Identifiable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    var location: String?
    var isOnline: Bool
    let organizer: String
    let attendees: [String]
    let color: MeetingColor
    var recurring: Bool
    var status: MeetingStatus

    init(id: String, title: String, startTime: Date, endTime: Date, location: String? = nil, isOnline: Bool = false, organizer: String, attendees: [String], color: MeetingColor, recurring: Bool = false, status: MeetingStatus = .upcoming) {
        self.id = id; self.title = title; self.startTime = startTime; self.endTime = endTime
        self.location = location; self.isOnline = isOnline; self.organizer = organizer
        self.attendees = attendees; self.color = color; self.recurring = recurring; self.status = status
    }
}

enum MeetingColor: String {
    case purple, blue, green, orange, red

    var color: Color {
        switch self {
        case .purple: return Color(hex: "6C63FF")
        case .blue: return Color(hex: "0078D4")
        case .green: return Color(hex: "34C759")
        case .orange: return Color(hex: "FF9F0A")
        case .red: return Color(hex: "FF3B30")
        }
    }
}

enum MeetingStatus: String {
    case upcoming, inProgress = "in-progress", completed
}

// MARK: - Unread Channel

struct UnreadChannel: Identifiable {
    let id: String
    let channelName: String
    let spaceName: String
    let count: Int
    let lastMessage: Date
}

// MARK: - Active Thread

struct ActiveThread: Identifiable {
    let id: String
    let channelName: String
    let spaceName: String
    let content: String
    let replies: Int
    let lastReply: Date
}

// MARK: - Activity

struct Activity: Identifiable {
    let id: String
    let type: ActivityType
    let title: String
    let subtitle: String
    let timestamp: Date
    let icon: String
    let color: Color
    var isRead: Bool
}

enum ActivityType: String {
    case message, mention, reaction, fileUpload, documentEdit, spaceInvite, taskAssigned
}

// MARK: - Notification

struct AppNotification: Identifiable {
    let id: String
    let type: NotificationType
    let title: String
    let message: String
    let detail: String
    let timestamp: Date
    var read: Bool
    var from: String?
    var formFields: [NotificationFormField]?

    var typeConfig: NotificationTypeConfig {
        type.config
    }
}

enum NotificationType: String, CaseIterable {
    case system, admin, security, update, invite, approval

    var config: NotificationTypeConfig {
        switch self {
        case .system:   return NotificationTypeConfig(icon: "server.rack", color: Color(hex: "8E8E93"), label: "System")
        case .admin:    return NotificationTypeConfig(icon: "bell.fill", color: Color(hex: "6C63FF"), label: "Admin")
        case .security: return NotificationTypeConfig(icon: "shield.fill", color: Color(hex: "FF3B30"), label: "Security")
        case .update:   return NotificationTypeConfig(icon: "arrow.triangle.2.circlepath", color: Color(hex: "34C759"), label: "Update")
        case .invite:   return NotificationTypeConfig(icon: "person.badge.plus", color: Color(hex: "A855F7"), label: "Invitation")
        case .approval: return NotificationTypeConfig(icon: "checkmark.seal.fill", color: Color(hex: "FF9F0A"), label: "Approval")
        }
    }
}

struct NotificationTypeConfig {
    let icon: String
    let color: Color
    let label: String
}

struct NotificationFormField: Identifiable {
    let id = UUID()
    let label: String
    let type: FormFieldType
    var options: [String]?
    var required: Bool

    enum FormFieldType: String {
        case text, textarea, select
    }
}

// MARK: - Space Request

struct SpaceRequest: Identifiable {
    let id: String
    let spaceName: String
    let spaceDescription: String
    let scenarioName: String
    let scenarioColor: String
    let channelCount: Int
    let dashboardCount: Int
    let appCount: Int
    let channels: [String]
    let dashboards: [String]
    let apps: [String]
    let permissions: String
    let ownerName: String
    let ownerAvatar: String
    let ownerTitle: String
    let requesterName: String
    let status: SpaceRequestStatus
    let createdAt: Date
    let updatedAt: Date
    var ownerApprovedAt: Date?
    var adminApprovedAt: Date?
    var rejectedAt: Date?
    var rejectedBy: String?
    var rejectionReason: String?
}

enum SpaceRequestStatus: String, CaseIterable {
    case pendingOwner = "pending-owner"
    case pendingAdmin = "pending-admin"
    case approved
    case rejected

    var label: String {
        switch self {
        case .pendingOwner: return "Awaiting Owner"
        case .pendingAdmin: return "Awaiting Admin"
        case .approved: return "Approved"
        case .rejected: return "Rejected"
        }
    }

    var icon: String {
        switch self {
        case .pendingOwner: return "clock.fill"
        case .pendingAdmin: return "shield.fill"
        case .approved: return "checkmark.circle.fill"
        case .rejected: return "xmark.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .pendingOwner: return Color(hex: "FF9F0A")
        case .pendingAdmin: return Color(hex: "6C63FF")
        case .approved: return Color(hex: "34C759")
        case .rejected: return Color(hex: "FF3B30")
        }
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
