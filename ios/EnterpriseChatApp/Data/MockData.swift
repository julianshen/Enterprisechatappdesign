import SwiftUI

struct MockData {
    // MARK: - Current User
    static let currentUser = User(
        id: "current",
        name: "Sarah Chen",
        avatar: "SC",
        status: .online,
        title: "Senior Software Engineer",
        department: "Engineering",
        email: "sarah.chen@company.com",
        phone: "+1 (555) 123-4567",
        timezone: "PST (UTC-8)"
    )

    // MARK: - Users
    static let users: [User] = [
        currentUser,
        User(id: "u1", name: "Alex Rivera", avatar: "AR", status: .online, title: "Product Manager", department: "Product"),
        User(id: "u2", name: "Jordan Lee", avatar: "JL", status: .away, title: "UX Designer", department: "Design"),
        User(id: "u3", name: "Morgan Kim", avatar: "MK", status: .busy, title: "DevOps Engineer", department: "Engineering"),
        User(id: "u4", name: "Taylor Swift", avatar: "TS", status: .online, title: "QA Lead", department: "Quality"),
        User(id: "u5", name: "Casey Zhang", avatar: "CZ", status: .offline, title: "Backend Engineer", department: "Engineering"),
        User(id: "u6", name: "Riley Patel", avatar: "RP", status: .online, title: "Frontend Engineer", department: "Engineering"),
        User(id: "u7", name: "Avery Johnson", avatar: "AJ", status: .away, title: "Data Scientist", department: "Data"),
        User(id: "u8", name: "Quinn Murphy", avatar: "QM", status: .online, title: "Security Engineer", department: "Security"),
    ]

    static func user(by id: String) -> User {
        users.first { $0.id == id } ?? currentUser
    }

    // MARK: - Direct Messages
    static let directMessages: [DirectMessage] = [
        DirectMessage(
            id: "dm1",
            user: users[1],
            lastMessage: "Hey, can you review the PR for the new feature?",
            lastMessageTime: Date().addingTimeInterval(-300),
            unreadCount: 2,
            messages: generateDMMessages(with: users[1]),
            isPinned: true
        ),
        DirectMessage(
            id: "dm2",
            user: users[2],
            lastMessage: "The new mockups are ready for review",
            lastMessageTime: Date().addingTimeInterval(-1800),
            unreadCount: 0,
            messages: generateDMMessages(with: users[2]),
            isPinned: true
        ),
        DirectMessage(
            id: "dm3",
            user: users[3],
            lastMessage: "Deploy pipeline is green ✅",
            lastMessageTime: Date().addingTimeInterval(-3600),
            unreadCount: 1,
            messages: generateDMMessages(with: users[3]),
            isPinned: false
        ),
        DirectMessage(
            id: "dm4",
            user: users[4],
            lastMessage: "All test cases passed for Sprint 24",
            lastMessageTime: Date().addingTimeInterval(-7200),
            unreadCount: 0,
            messages: generateDMMessages(with: users[4]),
            isPinned: false
        ),
        DirectMessage(
            id: "dm5",
            user: users[5],
            lastMessage: "Can we discuss the API architecture?",
            lastMessageTime: Date().addingTimeInterval(-14400),
            unreadCount: 0,
            messages: generateDMMessages(with: users[5]),
            isPinned: false
        ),
        DirectMessage(
            id: "dm6",
            user: users[6],
            lastMessage: "The component library is updated",
            lastMessageTime: Date().addingTimeInterval(-28800),
            unreadCount: 3,
            messages: generateDMMessages(with: users[6]),
            isPinned: false
        ),
    ]

    // MARK: - Group Chats
    static let groupChats: [GroupChat] = [
        GroupChat(
            id: "gc1",
            name: "Frontend Team",
            members: [users[0], users[1], users[2], users[6]],
            lastMessage: "Let's sync on the component migration",
            lastMessageTime: Date().addingTimeInterval(-600),
            unreadCount: 5,
            messages: generateGroupMessages(),
            avatar: nil,
            isPinned: true
        ),
        GroupChat(
            id: "gc2",
            name: "Sprint Planning",
            members: [users[0], users[1], users[3], users[4]],
            lastMessage: "Sprint 25 backlog is prioritized",
            lastMessageTime: Date().addingTimeInterval(-5400),
            unreadCount: 0,
            messages: generateGroupMessages(),
            avatar: nil,
            isPinned: false
        ),
        GroupChat(
            id: "gc3",
            name: "Lunch Crew 🍕",
            members: [users[0], users[2], users[5], users[7]],
            lastMessage: "Thai food today?",
            lastMessageTime: Date().addingTimeInterval(-10800),
            unreadCount: 12,
            messages: generateGroupMessages(),
            avatar: nil,
            isPinned: false
        ),
    ]

    // MARK: - Spaces
    static let spaces: [Space] = [
        Space(
            id: "s1",
            name: "Engineering",
            icon: "E",
            color: "5B5FC7",
            description: "Engineering team workspace for development and collaboration",
            channels: engineeringChannels,
            members: Array(users[0...6]),
            dashboards: engineeringDashboards,
            isFavorite: true
        ),
        Space(
            id: "s2",
            name: "Product",
            icon: "P",
            color: "2196F3",
            description: "Product management and strategy",
            channels: productChannels,
            members: [users[0], users[1], users[2], users[4]],
            dashboards: productDashboards,
            isFavorite: true
        ),
        Space(
            id: "s3",
            name: "Design",
            icon: "D",
            color: "E91E63",
            description: "Design team workspace",
            channels: designChannels,
            members: [users[0], users[2], users[6]],
            dashboards: [],
            isFavorite: false
        ),
        Space(
            id: "s4",
            name: "DevOps",
            icon: "O",
            color: "FF9800",
            description: "Infrastructure and operations",
            channels: devopsChannels,
            members: [users[0], users[3], users[5], users[8]],
            dashboards: devopsDashboards,
            isFavorite: false
        ),
        Space(
            id: "s5",
            name: "Data Science",
            icon: "S",
            color: "009688",
            description: "Data analytics and machine learning",
            channels: [
                Channel(id: "ds-general", name: "general", type: .text, unreadCount: 0, messages: generateChannelMessages(), isPinned: false),
                Channel(id: "ds-models", name: "models", type: .text, unreadCount: 2, messages: generateChannelMessages(), isPinned: false),
            ],
            members: [users[0], users[7]],
            dashboards: [],
            isFavorite: false
        ),
    ]

    // MARK: - Channels

    static let engineeringChannels: [Channel] = [
        Channel(id: "e-general", name: "general", type: .text, description: "General engineering discussions", unreadCount: 3, messages: generateChannelMessages(), isPinned: true, lastActivity: Date().addingTimeInterval(-120)),
        Channel(id: "e-frontend", name: "frontend", type: .text, description: "Frontend development", unreadCount: 0, messages: generateChannelMessages(), isPinned: false, lastActivity: Date().addingTimeInterval(-3600)),
        Channel(id: "e-backend", name: "backend", type: .text, description: "Backend development", unreadCount: 7, messages: generateChannelMessages(), isPinned: false, lastActivity: Date().addingTimeInterval(-900)),
        Channel(id: "e-announcements", name: "announcements", type: .announcement, description: "Team announcements", unreadCount: 1, messages: generateChannelMessages(), isPinned: true, lastActivity: Date().addingTimeInterval(-7200)),
        Channel(id: "e-code-review", name: "code-review", type: .text, description: "Code review discussions", unreadCount: 0, messages: generateChannelMessages(), isPinned: false, lastActivity: Date().addingTimeInterval(-14400)),
        Channel(id: "e-private", name: "leads-only", type: .privateChannel, description: "Engineering leads discussion", unreadCount: 0, messages: generateChannelMessages(), isPinned: false, lastActivity: Date().addingTimeInterval(-28800)),
    ]

    static let productChannels: [Channel] = [
        Channel(id: "p-general", name: "general", type: .text, unreadCount: 1, messages: generateChannelMessages(), isPinned: true),
        Channel(id: "p-roadmap", name: "roadmap", type: .text, unreadCount: 0, messages: generateChannelMessages(), isPinned: false),
        Channel(id: "p-feedback", name: "user-feedback", type: .text, unreadCount: 4, messages: generateChannelMessages(), isPinned: false),
        Channel(id: "p-announcements", name: "announcements", type: .announcement, unreadCount: 0, messages: generateChannelMessages(), isPinned: true),
    ]

    static let designChannels: [Channel] = [
        Channel(id: "d-general", name: "general", type: .text, unreadCount: 0, messages: generateChannelMessages(), isPinned: true),
        Channel(id: "d-reviews", name: "design-reviews", type: .text, unreadCount: 2, messages: generateChannelMessages(), isPinned: false),
        Channel(id: "d-system", name: "design-system", type: .text, unreadCount: 0, messages: generateChannelMessages(), isPinned: false),
    ]

    static let devopsChannels: [Channel] = [
        Channel(id: "o-general", name: "general", type: .text, unreadCount: 0, messages: generateChannelMessages(), isPinned: true),
        Channel(id: "o-alerts", name: "alerts", type: .announcement, unreadCount: 3, messages: generateChannelMessages(), isPinned: true),
        Channel(id: "o-deployments", name: "deployments", type: .text, unreadCount: 0, messages: generateChannelMessages(), isPinned: false),
        Channel(id: "o-incidents", name: "incidents", type: .privateChannel, unreadCount: 1, messages: generateChannelMessages(), isPinned: false),
    ]

    // MARK: - Dashboards

    static let engineeringDashboards: [SpaceDashboard] = [
        SpaceDashboard(id: "ed1", name: "Sprint Overview", icon: "chart.bar.fill", widgets: [
            DashboardWidget(id: "w1", type: .metric, title: "Sprint Velocity", data: WidgetData(value: "42", trend: "+8%", trendUp: true)),
            DashboardWidget(id: "w2", type: .metric, title: "Open PRs", data: WidgetData(value: "7", trend: "-2", trendUp: true)),
            DashboardWidget(id: "w3", type: .metric, title: "Bug Count", data: WidgetData(value: "12", trend: "+3", trendUp: false)),
            DashboardWidget(id: "w4", type: .progress, title: "Sprint Progress", data: WidgetData(progress: 0.68, progressColor: "5B5FC7")),
            DashboardWidget(id: "w5", type: .list, title: "Recent Deployments", data: WidgetData(items: [
                WidgetItem(label: "v2.4.1 - Production", status: "Success", statusColor: "34C759"),
                WidgetItem(label: "v2.4.0 - Staging", status: "Success", statusColor: "34C759"),
                WidgetItem(label: "v2.3.9 - Production", status: "Rolled Back", statusColor: "FF3B30"),
                WidgetItem(label: "v2.3.8 - Production", status: "Success", statusColor: "34C759"),
            ])),
            DashboardWidget(id: "w6", type: .members, title: "Team", data: WidgetData(members: ["u1", "u2", "u3", "u4", "u5", "u6"])),
        ]),
        SpaceDashboard(id: "ed2", name: "Code Quality", icon: "checkmark.shield.fill", widgets: [
            DashboardWidget(id: "w7", type: .metric, title: "Test Coverage", data: WidgetData(value: "87%", trend: "+2%", trendUp: true)),
            DashboardWidget(id: "w8", type: .metric, title: "Tech Debt Score", data: WidgetData(value: "B+", trend: "Stable", trendUp: true)),
            DashboardWidget(id: "w9", type: .progress, title: "Migration Progress", data: WidgetData(progress: 0.45, progressColor: "2196F3")),
        ]),
    ]

    static let productDashboards: [SpaceDashboard] = [
        SpaceDashboard(id: "pd1", name: "Product Metrics", icon: "chart.line.uptrend.xyaxis", widgets: [
            DashboardWidget(id: "pw1", type: .metric, title: "DAU", data: WidgetData(value: "24.5K", trend: "+12%", trendUp: true)),
            DashboardWidget(id: "pw2", type: .metric, title: "NPS Score", data: WidgetData(value: "72", trend: "+5", trendUp: true)),
            DashboardWidget(id: "pw3", type: .metric, title: "Churn Rate", data: WidgetData(value: "2.1%", trend: "-0.3%", trendUp: true)),
            DashboardWidget(id: "pw4", type: .list, title: "Feature Requests", data: WidgetData(items: [
                WidgetItem(label: "Dark mode support", status: "In Progress", statusColor: "FF9500"),
                WidgetItem(label: "Mobile app", status: "Planned", statusColor: "5B5FC7"),
                WidgetItem(label: "SSO integration", status: "Done", statusColor: "34C759"),
                WidgetItem(label: "API v2", status: "In Review", statusColor: "2196F3"),
            ])),
        ]),
    ]

    static let devopsDashboards: [SpaceDashboard] = [
        SpaceDashboard(id: "od1", name: "Infrastructure", icon: "server.rack", widgets: [
            DashboardWidget(id: "ow1", type: .metric, title: "Uptime", data: WidgetData(value: "99.97%", trend: "+0.02%", trendUp: true)),
            DashboardWidget(id: "ow2", type: .metric, title: "Avg Response", data: WidgetData(value: "145ms", trend: "-12ms", trendUp: true)),
            DashboardWidget(id: "ow3", type: .metric, title: "Error Rate", data: WidgetData(value: "0.03%", trend: "-0.01%", trendUp: true)),
            DashboardWidget(id: "ow4", type: .progress, title: "K8s Migration", data: WidgetData(progress: 0.82, progressColor: "FF9800")),
        ]),
    ]

    // MARK: - Files

    static let files: [FileItem] = [
        FileItem(id: "f1", name: "Q4 Planning", type: .folder, size: "12 items", uploadedBy: "u1", uploadedAt: Date().addingTimeInterval(-86400), securityLevel: .b, accessLevel: .restricted, isStarred: true, parentFolder: nil),
        FileItem(id: "f2", name: "Architecture Overview.pdf", type: .pdf, size: "2.4 MB", uploadedBy: "current", uploadedAt: Date().addingTimeInterval(-172800), securityLevel: .b, accessLevel: .restricted, isStarred: true, parentFolder: nil),
        FileItem(id: "f3", name: "Sprint Review Deck.pptx", type: .ppt, size: "8.1 MB", uploadedBy: "u1", uploadedAt: Date().addingTimeInterval(-259200), securityLevel: .c, accessLevel: .public, isStarred: false, parentFolder: nil),
        FileItem(id: "f4", name: "API Documentation.docx", type: .doc, size: "1.2 MB", uploadedBy: "u5", uploadedAt: Date().addingTimeInterval(-345600), securityLevel: .b, accessLevel: .restricted, isStarred: false, parentFolder: nil),
        FileItem(id: "f5", name: "Budget Tracker.xlsx", type: .xls, size: "456 KB", uploadedBy: "u1", uploadedAt: Date().addingTimeInterval(-432000), securityLevel: .a, accessLevel: .confidential, isStarred: true, parentFolder: nil),
        FileItem(id: "f6", name: "Team Photo.jpg", type: .image, size: "3.8 MB", uploadedBy: "u2", uploadedAt: Date().addingTimeInterval(-518400), securityLevel: .c, accessLevel: .public, isStarred: false, parentFolder: nil),
        FileItem(id: "f7", name: "Demo Recording.mp4", type: .video, size: "124 MB", uploadedBy: "u4", uploadedAt: Date().addingTimeInterval(-604800), securityLevel: .c, accessLevel: .public, isStarred: false, parentFolder: nil),
        FileItem(id: "f8", name: "Source Bundle.zip", type: .zip, size: "45 MB", uploadedBy: "u3", uploadedAt: Date().addingTimeInterval(-691200), securityLevel: .b, accessLevel: .restricted, isStarred: false, parentFolder: nil),
        FileItem(id: "f9", name: "config.yaml", type: .code, size: "12 KB", uploadedBy: "u3", uploadedAt: Date().addingTimeInterval(-777600), securityLevel: .a, accessLevel: .confidential, isStarred: false, parentFolder: nil),
        FileItem(id: "f10", name: "Design Assets", type: .folder, size: "8 items", uploadedBy: "u2", uploadedAt: Date().addingTimeInterval(-864000), securityLevel: .c, accessLevel: .public, isStarred: false, parentFolder: nil),
    ]

    // MARK: - Documents

    static let documents: [Document] = [
        Document(
            id: "doc1",
            title: "Project Roadmap 2026",
            createdBy: "u1",
            createdAt: Date().addingTimeInterval(-604800),
            updatedAt: Date().addingTimeInterval(-3600),
            blocks: [
                DocumentBlock(id: "b1", type: .heading1, content: "Project Roadmap 2026"),
                DocumentBlock(id: "b2", type: .callout, content: "This document outlines our strategic priorities for 2026.", metadata: BlockMetadata(calloutColor: "5B5FC7", calloutIcon: "lightbulb")),
                DocumentBlock(id: "b3", type: .heading2, content: "Q1 Goals"),
                DocumentBlock(id: "b4", type: .todo, content: "Launch mobile app MVP", metadata: BlockMetadata(isChecked: true)),
                DocumentBlock(id: "b5", type: .todo, content: "Complete API v2 migration", metadata: BlockMetadata(isChecked: false)),
                DocumentBlock(id: "b6", type: .todo, content: "Achieve 95% test coverage", metadata: BlockMetadata(isChecked: false)),
                DocumentBlock(id: "b7", type: .heading2, content: "Q2 Goals"),
                DocumentBlock(id: "b8", type: .bullet, content: "Scale infrastructure to support 100K concurrent users"),
                DocumentBlock(id: "b9", type: .bullet, content: "Launch enterprise SSO integration"),
                DocumentBlock(id: "b10", type: .bullet, content: "Implement real-time collaboration features"),
            ],
            securityLevel: .b,
            accessLevel: .restricted,
            icon: "📋",
            isStarred: true,
            tags: ["roadmap", "planning", "2026"]
        ),
        Document(
            id: "doc2",
            title: "API Design Guidelines",
            createdBy: "u5",
            createdAt: Date().addingTimeInterval(-1209600),
            updatedAt: Date().addingTimeInterval(-86400),
            blocks: [
                DocumentBlock(id: "b11", type: .heading1, content: "API Design Guidelines"),
                DocumentBlock(id: "b12", type: .paragraph, content: "This guide establishes conventions for designing RESTful APIs across our platform."),
                DocumentBlock(id: "b13", type: .heading2, content: "Naming Conventions"),
                DocumentBlock(id: "b14", type: .paragraph, content: "Use kebab-case for URL paths and camelCase for JSON properties."),
                DocumentBlock(id: "b15", type: .code, content: "GET /api/v2/user-profiles\n{\n  \"userId\": \"abc123\",\n  \"displayName\": \"Sarah Chen\"\n}", metadata: BlockMetadata(language: "json")),
                DocumentBlock(id: "b16", type: .heading2, content: "Error Handling"),
                DocumentBlock(id: "b17", type: .paragraph, content: "All errors should follow the standard error response format."),
            ],
            securityLevel: .c,
            accessLevel: .public,
            icon: "📖",
            isStarred: false,
            tags: ["api", "guidelines", "engineering"]
        ),
        Document(
            id: "doc3",
            title: "Onboarding Checklist",
            createdBy: "current",
            createdAt: Date().addingTimeInterval(-2592000),
            updatedAt: Date().addingTimeInterval(-172800),
            blocks: [
                DocumentBlock(id: "b18", type: .heading1, content: "New Team Member Onboarding"),
                DocumentBlock(id: "b19", type: .callout, content: "Welcome to the team! Follow this checklist to get set up.", metadata: BlockMetadata(calloutColor: "34C759", calloutIcon: "hand.wave")),
                DocumentBlock(id: "b20", type: .heading2, content: "Day 1"),
                DocumentBlock(id: "b21", type: .todo, content: "Set up development environment", metadata: BlockMetadata(isChecked: true)),
                DocumentBlock(id: "b22", type: .todo, content: "Complete security training", metadata: BlockMetadata(isChecked: true)),
                DocumentBlock(id: "b23", type: .todo, content: "Join required Slack channels", metadata: BlockMetadata(isChecked: true)),
                DocumentBlock(id: "b24", type: .heading2, content: "Week 1"),
                DocumentBlock(id: "b25", type: .todo, content: "Review architecture documentation", metadata: BlockMetadata(isChecked: false)),
                DocumentBlock(id: "b26", type: .todo, content: "Submit first PR", metadata: BlockMetadata(isChecked: false)),
            ],
            securityLevel: .c,
            accessLevel: .public,
            icon: "✅",
            isStarred: true,
            tags: ["onboarding", "hr", "checklist"]
        ),
        Document(
            id: "doc4",
            title: "Incident Response Playbook",
            createdBy: "u3",
            createdAt: Date().addingTimeInterval(-5184000),
            updatedAt: Date().addingTimeInterval(-604800),
            blocks: [
                DocumentBlock(id: "b27", type: .heading1, content: "Incident Response Playbook"),
                DocumentBlock(id: "b28", type: .callout, content: "Critical: Follow these steps during any P1/P2 incident.", metadata: BlockMetadata(calloutColor: "FF3B30", calloutIcon: "exclamationmark.triangle")),
                DocumentBlock(id: "b29", type: .heading2, content: "Severity Levels"),
                DocumentBlock(id: "b30", type: .numbered, content: "P1 - Service completely down, all users affected"),
                DocumentBlock(id: "b31", type: .numbered, content: "P2 - Major feature unavailable, >50% users affected"),
                DocumentBlock(id: "b32", type: .numbered, content: "P3 - Minor feature degraded, <10% users affected"),
                DocumentBlock(id: "b33", type: .numbered, content: "P4 - Cosmetic issue, no functional impact"),
            ],
            securityLevel: .a,
            accessLevel: .confidential,
            icon: "🚨",
            isStarred: false,
            tags: ["incident", "devops", "runbook"]
        ),
        Document(
            id: "doc5",
            title: "Design System Tokens",
            createdBy: "u2",
            createdAt: Date().addingTimeInterval(-3888000),
            updatedAt: Date().addingTimeInterval(-259200),
            blocks: [
                DocumentBlock(id: "b34", type: .heading1, content: "Design System Tokens"),
                DocumentBlock(id: "b35", type: .paragraph, content: "Our design tokens define the visual language of the product."),
                DocumentBlock(id: "b36", type: .heading2, content: "Colors"),
                DocumentBlock(id: "b37", type: .paragraph, content: "Primary: #5B5FC7 | Secondary: #2196F3 | Success: #34C759"),
                DocumentBlock(id: "b38", type: .heading2, content: "Typography"),
                DocumentBlock(id: "b39", type: .paragraph, content: "Heading: SF Pro Display | Body: SF Pro Text | Code: SF Mono"),
            ],
            securityLevel: .c,
            accessLevel: .public,
            icon: "🎨",
            isStarred: true,
            tags: ["design", "tokens", "ui"]
        ),
    ]

    // MARK: - Activities

    static let activities: [Activity] = [
        Activity(id: "a1", type: .mention, title: "Alex Rivera mentioned you", subtitle: "in #general: \"@Sarah can you take a look at this?\"", timestamp: Date().addingTimeInterval(-300), icon: "at", color: .blue, isRead: false),
        Activity(id: "a2", type: .message, title: "New message in Frontend Team", subtitle: "Riley: The component library is updated", timestamp: Date().addingTimeInterval(-900), icon: "bubble.left.fill", color: Color(hex: "5B5FC7"), isRead: false),
        Activity(id: "a3", type: .fileUpload, title: "File uploaded to Engineering", subtitle: "Architecture Overview.pdf (2.4 MB)", timestamp: Date().addingTimeInterval(-3600), icon: "arrow.up.doc.fill", color: .green, isRead: true),
        Activity(id: "a4", type: .reaction, title: "Morgan Kim reacted to your message", subtitle: "👍 to \"Deploy pipeline is green\"", timestamp: Date().addingTimeInterval(-5400), icon: "face.smiling.fill", color: .orange, isRead: true),
        Activity(id: "a5", type: .documentEdit, title: "Document updated", subtitle: "Project Roadmap 2026 was edited by Alex Rivera", timestamp: Date().addingTimeInterval(-7200), icon: "doc.text.fill", color: .purple, isRead: true),
        Activity(id: "a6", type: .taskAssigned, title: "Task assigned to you", subtitle: "\"Fix authentication bug\" in Sprint 25", timestamp: Date().addingTimeInterval(-10800), icon: "checkmark.circle.fill", color: .teal, isRead: false),
        Activity(id: "a7", type: .spaceInvite, title: "Invited to Data Science space", subtitle: "Avery Johnson invited you", timestamp: Date().addingTimeInterval(-14400), icon: "person.badge.plus", color: .indigo, isRead: true),
        Activity(id: "a8", type: .message, title: "New message from Casey Zhang", subtitle: "\"Can we discuss the API architecture?\"", timestamp: Date().addingTimeInterval(-28800), icon: "bubble.left.fill", color: Color(hex: "5B5FC7"), isRead: true),
    ]

    // MARK: - Message Generators

    static func generateDMMessages(with user: User) -> [Message] {
        let conversations: [(String, String, TimeInterval)] = [
            (user.id, "Hey! How's the project going?", -7200),
            ("current", "Going well! Just finished the new feature implementation.", -7000),
            (user.id, "That's great. Can you walk me through the changes?", -6800),
            ("current", "Sure! I'll set up a quick call. The main changes are in the auth module.", -6600),
            (user.id, "Perfect. I also wanted to discuss the timeline for next sprint.", -6400),
            ("current", "Let's cover that too. I have some thoughts on the prioritization.", -6200),
            (user.id, "Sounds good! Looking forward to it 👍", -6000),
            ("current", "See you then! 🙌", -5800),
        ]

        return conversations.map { userId, content, offset in
            Message(
                id: UUID().uuidString,
                userId: userId,
                content: content,
                timestamp: Date().addingTimeInterval(offset),
                reactions: offset == -6000 ? [Reaction(emoji: "👍", users: ["current"], count: 1)] : []
            )
        }
    }

    static func generateGroupMessages() -> [Message] {
        [
            Message(id: UUID().uuidString, userId: "u1", content: "Team, we need to finalize the component migration plan by Friday.", timestamp: Date().addingTimeInterval(-3600)),
            Message(id: UUID().uuidString, userId: "u6", content: "I've started migrating the Button and Input components. Should be done by tomorrow.", timestamp: Date().addingTimeInterval(-3400)),
            Message(id: UUID().uuidString, userId: "u2", content: "The new design tokens are ready. I'll share the Figma link.", timestamp: Date().addingTimeInterval(-3200)),
            Message(id: UUID().uuidString, userId: "current", content: "Great progress! I'll handle the Card and Modal components.", timestamp: Date().addingTimeInterval(-3000)),
            Message(id: UUID().uuidString, userId: "u1", content: "Perfect. Let's sync on the remaining components in tomorrow's standup.", timestamp: Date().addingTimeInterval(-2800)),
            Message(id: UUID().uuidString, userId: "u6", content: "Should we also update the documentation as we go?", timestamp: Date().addingTimeInterval(-2600)),
            Message(id: UUID().uuidString, userId: "current", content: "Yes, let's update the Storybook stories alongside the migration.", timestamp: Date().addingTimeInterval(-2400)),
        ]
    }

    static func generateChannelMessages() -> [Message] {
        [
            Message(id: UUID().uuidString, userId: "u3", content: "Deployment to staging completed successfully. All health checks passing.", timestamp: Date().addingTimeInterval(-1800), reactions: [Reaction(emoji: "🎉", users: ["u1", "u4"], count: 2)]),
            Message(id: UUID().uuidString, userId: "u1", content: "Nice work! Let's monitor for an hour before promoting to production.", timestamp: Date().addingTimeInterval(-1600)),
            Message(id: UUID().uuidString, userId: "u5", content: "API latency looks normal. No anomalies in the error logs.", timestamp: Date().addingTimeInterval(-1400)),
            Message(id: UUID().uuidString, userId: "current", content: "I've verified the new endpoints are responding correctly. LGTM! 👍", timestamp: Date().addingTimeInterval(-1200)),
            Message(id: UUID().uuidString, userId: "u3", content: "Promoting to production now. ETA: 10 minutes.", timestamp: Date().addingTimeInterval(-1000), isPinned: true),
            Message(id: UUID().uuidString, userId: "u4", content: "All regression tests passed. Good to go!", timestamp: Date().addingTimeInterval(-800)),
            Message(id: UUID().uuidString, userId: "u3", content: "Production deployment complete ✅ v2.4.1 is live!", timestamp: Date().addingTimeInterval(-600), reactions: [Reaction(emoji: "🚀", users: ["u1", "u4", "u5", "current"], count: 4), Reaction(emoji: "👏", users: ["u2", "u6"], count: 2)]),
        ]
    }
}
