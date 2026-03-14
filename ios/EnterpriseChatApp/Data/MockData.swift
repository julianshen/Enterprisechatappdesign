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

    // MARK: - Meetings

    static let meetings: [Meeting] = {
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        func time(_ hour: Int, _ min: Int, daysOffset: Int = 0) -> Date {
            cal.date(bySettingHour: hour, minute: min, second: 0, of: cal.date(byAdding: .day, value: daysOffset, to: today)!)!
        }
        return [
            Meeting(id: "m1", title: "Daily Standup", startTime: time(9, 0), endTime: time(9, 15), location: "Teams Call", isOnline: true, organizer: "u1", attendees: ["current", "u1", "u2", "u3"], color: .purple, recurring: true, status: .completed),
            Meeting(id: "m2", title: "Sprint Planning", startTime: time(10, 30), endTime: time(11, 30), location: "Teams Call", isOnline: true, organizer: "u2", attendees: ["current", "u1", "u2", "u3", "u4"], color: .blue, status: .inProgress),
            Meeting(id: "m3", title: "Design Review", startTime: time(14, 0), endTime: time(15, 0), location: "Conference Room A", organizer: "u3", attendees: ["current", "u1", "u3"], color: .green, status: .upcoming),
            Meeting(id: "m4", title: "1:1 with Manager", startTime: time(16, 0), endTime: time(16, 30), location: "Teams Call", isOnline: true, organizer: "u1", attendees: ["current", "u1"], color: .orange, status: .upcoming),
            Meeting(id: "m5", title: "Team Retrospective", startTime: time(10, 0, daysOffset: 1), endTime: time(11, 0, daysOffset: 1), location: "Teams Call", isOnline: true, organizer: "u2", attendees: ["current", "u1", "u2", "u3", "u4"], color: .purple, recurring: true, status: .upcoming),
            Meeting(id: "m6", title: "Product Demo", startTime: time(15, 0, daysOffset: 2), endTime: time(16, 0, daysOffset: 2), location: "Main Auditorium", organizer: "u4", attendees: ["current", "u1", "u2", "u3", "u4"], color: .red, status: .upcoming),
            Meeting(id: "m7", title: "Architecture Review", startTime: time(11, 0, daysOffset: 3), endTime: time(12, 30, daysOffset: 3), location: "Teams Call", isOnline: true, organizer: "u2", attendees: ["current", "u2", "u4"], color: .blue, status: .upcoming),
            Meeting(id: "m8", title: "All Hands Meeting", startTime: time(9, 0, daysOffset: 4), endTime: time(10, 0, daysOffset: 4), location: "Main Auditorium", organizer: "u1", attendees: ["current", "u1", "u2", "u3", "u4"], color: .purple, recurring: true, status: .upcoming),
        ]
    }()

    // MARK: - Unread Channels

    static let unreadChannels: [UnreadChannel] = [
        UnreadChannel(id: "uc1", channelName: "general", spaceName: "Company HQ", count: 3, lastMessage: Date().addingTimeInterval(-1800)),
        UnreadChannel(id: "uc2", channelName: "general", spaceName: "Engineering", count: 5, lastMessage: Date().addingTimeInterval(-2700)),
        UnreadChannel(id: "uc3", channelName: "backend", spaceName: "Engineering", count: 2, lastMessage: Date().addingTimeInterval(-5400)),
        UnreadChannel(id: "uc4", channelName: "general", spaceName: "SRE", count: 4, lastMessage: Date().addingTimeInterval(-7200)),
        UnreadChannel(id: "uc5", channelName: "alerts", spaceName: "SRE", count: 2, lastMessage: Date().addingTimeInterval(-10800)),
    ]

    // MARK: - Active Threads

    static let activeThreads: [ActiveThread] = [
        ActiveThread(id: "t1", channelName: "general", spaceName: "Company HQ", content: "Hey everyone! Welcome to the new chat platform...", replies: 3, lastReply: Date().addingTimeInterval(-3600)),
        ActiveThread(id: "t2", channelName: "general", spaceName: "Engineering", content: "I'm seeing some performance issues with the new build...", replies: 8, lastReply: Date().addingTimeInterval(-5400)),
        ActiveThread(id: "t3", channelName: "backend", spaceName: "Engineering", content: "The new API rate limiting is causing timeouts in staging", replies: 5, lastReply: Date().addingTimeInterval(-7200)),
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

    // MARK: - Notifications

    static let notifications: [AppNotification] = [
        AppNotification(
            id: "notif-1", type: .approval,
            title: "Budget Approval Request",
            message: "Alice Williams requested budget approval for Q2 marketing campaign ($12,500).",
            detail: "The Marketing team is requesting $12,500 for the Q2 digital advertising campaign. This covers paid social media ads across LinkedIn, Twitter, and Google Ads.\n\nBreakdown:\n• LinkedIn Ads: $5,000\n• Google Ads: $4,500\n• Twitter/X Ads: $2,000\n• Creative Assets: $1,000\n\nPlease review and approve or provide feedback below.",
            timestamp: Date().addingTimeInterval(-1800),
            read: false,
            from: "Alice Williams",
            formFields: [
                NotificationFormField(label: "Decision", type: .select, options: ["Approve", "Reject", "Request Changes"], required: true),
                NotificationFormField(label: "Comments", type: .textarea, required: false),
            ]
        ),
        AppNotification(
            id: "notif-2", type: .approval,
            title: "PTO Request — Bob Johnson",
            message: "Bob Johnson submitted a PTO request for Feb 24–28 (5 days).",
            detail: "Bob Johnson has submitted a paid time off request:\n\n• Dates: February 24–28, 2026\n• Duration: 5 business days\n• Remaining PTO balance: 12 days\n• Coverage: Charlie Brown has agreed to cover urgent backend issues.\n• Reason: Personal / Family\n\nAs Bob's direct manager, please approve or deny this request.",
            timestamp: Date().addingTimeInterval(-5400),
            read: false,
            from: "Bob Johnson",
            formFields: [
                NotificationFormField(label: "Decision", type: .select, options: ["Approve", "Deny"], required: true),
                NotificationFormField(label: "Reason (if denied)", type: .textarea, required: false),
            ]
        ),
        AppNotification(
            id: "notif-3", type: .admin,
            title: "New Company Policy Published",
            message: "The updated remote work policy has been published. Please review it before March 1st.",
            detail: "Dear Team,\n\nWe are pleased to announce the updated Remote Work Policy, effective March 1, 2026. Key changes include:\n\n1. Flexible Hours: Core hours are now 10 AM – 3 PM in your local timezone.\n\n2. In-Office Days: Minimum 2 days per week (down from 3).\n\n3. Home Office Stipend: Increased from $500 to $750/year.\n\n4. International Remote Work: Up to 4 weeks per year (up from 2 weeks).\n\nPlease read the full policy document and acknowledge receipt by March 1st.\n\nBest regards,\nHR Team",
            timestamp: Date().addingTimeInterval(-18000),
            read: false,
            from: "HR Department"
        ),
        AppNotification(
            id: "notif-4", type: .security,
            title: "Password Expiring Soon",
            message: "Your password will expire in 7 days. Please update it to maintain access.",
            detail: "Your current password is scheduled to expire on February 22, 2026 per company security policy.\n\nPassword requirements:\n• Minimum 12 characters\n• At least one uppercase letter\n• At least one number\n• At least one special character\n• Cannot reuse your last 5 passwords\n\nTo update your password, go to Settings > Security > Change Password.",
            timestamp: Date().addingTimeInterval(-36000),
            read: false,
            from: "IT Security"
        ),
        AppNotification(
            id: "notif-5", type: .invite,
            title: "Space Invitation — Product",
            message: "Jane Smith invited you to join the \"Product\" space.",
            detail: "You've been invited to join the Product space by Jane Smith (Product Manager).\n\nChannels included:\n• #general — Team announcements\n• #roadmap — Product roadmap updates\n• #research — User research and feedback\n• #sprints — Sprint planning and tracking\n\nYou can accept or decline this invitation.",
            timestamp: Date().addingTimeInterval(-43200),
            read: false,
            from: "Jane Smith",
            formFields: [
                NotificationFormField(label: "Response", type: .select, options: ["Accept Invitation", "Decline Invitation"], required: true),
                NotificationFormField(label: "Message to Jane (optional)", type: .text, required: false),
            ]
        ),
        AppNotification(
            id: "notif-6", type: .update,
            title: "App Update — v2.4.0",
            message: "Version 2.4.0 is now available with improved performance and new emoji reactions.",
            detail: "What's New in v2.4.0:\n\n✦ Performance Improvements\n  — Chat messages now load 40% faster\n  — Reduced memory usage for large channels\n\n✦ New Features\n  — Expanded emoji reaction picker\n  — Message scheduling: compose now, send later\n  — Pinned messages in dedicated sidebar panel\n\n✦ Bug Fixes\n  — Fixed notification badge not clearing on read\n  — Fixed dark mode contrast issues\n  — Resolved file upload timeout for large files",
            timestamp: Date().addingTimeInterval(-86400),
            read: true,
            from: "Platform Team"
        ),
        AppNotification(
            id: "notif-7", type: .system,
            title: "Scheduled Maintenance",
            message: "The platform will undergo maintenance on Feb 16, 2:00–4:00 AM UTC.",
            detail: "Scheduled Maintenance Notice\n\nDate: Sunday, February 16, 2026\nTime: 2:00 AM – 4:00 AM UTC\nExpected Downtime: Up to 30 minutes\n\nWhat's being done:\n• Database optimization\n• Security patch deployment\n• SSL certificate renewal\n• Infrastructure scaling\n\nStatus page: status.company.com",
            timestamp: Date().addingTimeInterval(-100800),
            read: true,
            from: "DevOps Team"
        ),
        AppNotification(
            id: "notif-8", type: .approval,
            title: "Access Request — Staging",
            message: "Charlie Brown requested access to the staging deployment environment.",
            detail: "Access Request Details:\n\n• Requester: Charlie Brown (Senior Engineer)\n• Resource: Staging Deployment Environment\n• Access Level: Read + Deploy\n• Justification: Need staging access to test payment gateway integration.\n• Duration: Permanent\n\nSecurity Note: This grants SSH access and CI/CD pipeline deployment permissions.",
            timestamp: Date().addingTimeInterval(-172800),
            read: true,
            from: "Charlie Brown",
            formFields: [
                NotificationFormField(label: "Decision", type: .select, options: ["Grant Access", "Deny Access", "Grant Temporary (30 days)"], required: true),
                NotificationFormField(label: "Security Notes", type: .textarea, required: false),
            ]
        ),
    ]

    // MARK: - Space Requests

    static let spaceRequests: [SpaceRequest] = [
        SpaceRequest(
            id: "req-1",
            spaceName: "Customer Success Hub",
            spaceDescription: "Centralized workspace for customer success team collaboration, onboarding playbooks, and account health tracking.",
            scenarioName: "Customer Success",
            scenarioColor: "FF6B9D",
            channelCount: 4, dashboardCount: 2, appCount: 1,
            channels: ["#general", "#onboarding", "#escalations", "#renewals"],
            dashboards: ["Account Health", "Renewal Pipeline"],
            apps: ["Salesforce Connect"],
            permissions: "Team members can post and manage content. Guests have read-only access.",
            ownerName: "Alex Rivera",
            ownerAvatar: "AR",
            ownerTitle: "VP Customer Success",
            requesterName: "Sarah Chen",
            status: .pendingOwner,
            createdAt: Date().addingTimeInterval(-7200),
            updatedAt: Date().addingTimeInterval(-7200)
        ),
        SpaceRequest(
            id: "req-2",
            spaceName: "Data Engineering Lab",
            spaceDescription: "Workspace for the data engineering team to collaborate on pipeline development and data quality initiatives.",
            scenarioName: "Engineering Team",
            scenarioColor: "6C63FF",
            channelCount: 5, dashboardCount: 3, appCount: 2,
            channels: ["#general", "#pipelines", "#data-quality", "#alerts", "#experiments"],
            dashboards: ["Pipeline Status", "Data Quality Scores", "Cost Tracking"],
            apps: ["Snowflake", "dbt Cloud"],
            permissions: "All members have full access. External collaborators need approval.",
            ownerName: "Sarah Chen",
            ownerAvatar: "SC",
            ownerTitle: "Senior Software Engineer",
            requesterName: "Sarah Chen",
            status: .pendingAdmin,
            createdAt: Date().addingTimeInterval(-86400),
            updatedAt: Date().addingTimeInterval(-43200),
            ownerApprovedAt: Date().addingTimeInterval(-43200)
        ),
        SpaceRequest(
            id: "req-3",
            spaceName: "Marketing Campaign Q2",
            spaceDescription: "Cross-functional space for Q2 marketing campaign planning and execution.",
            scenarioName: "Marketing",
            scenarioColor: "34C759",
            channelCount: 3, dashboardCount: 1, appCount: 0,
            channels: ["#general", "#content", "#analytics"],
            dashboards: ["Campaign Performance"],
            apps: [],
            permissions: "Marketing team has full access. Stakeholders have comment-only access.",
            ownerName: "Morgan Kim",
            ownerAvatar: "MK",
            ownerTitle: "Marketing Director",
            requesterName: "Sarah Chen",
            status: .approved,
            createdAt: Date().addingTimeInterval(-259200),
            updatedAt: Date().addingTimeInterval(-172800),
            ownerApprovedAt: Date().addingTimeInterval(-216000),
            adminApprovedAt: Date().addingTimeInterval(-172800)
        ),
        SpaceRequest(
            id: "req-4",
            spaceName: "Experimental AI Sandbox",
            spaceDescription: "Sandbox environment for testing AI/ML integrations with production-like data.",
            scenarioName: "Research & Development",
            scenarioColor: "FF9F0A",
            channelCount: 2, dashboardCount: 0, appCount: 3,
            channels: ["#general", "#experiments"],
            dashboards: [],
            apps: ["OpenAI API", "Hugging Face", "Weights & Biases"],
            permissions: "Restricted to approved researchers only.",
            ownerName: "Riley Park",
            ownerAvatar: "RP",
            ownerTitle: "ML Team Lead",
            requesterName: "Sarah Chen",
            status: .rejected,
            createdAt: Date().addingTimeInterval(-432000),
            updatedAt: Date().addingTimeInterval(-345600),
            rejectedAt: Date().addingTimeInterval(-345600),
            rejectedBy: "System Admin",
            rejectionReason: "AI sandbox environments require additional security review and VP-level approval per policy SEC-2024-15. Please resubmit with VP Engineering sign-off."
        ),
    ]

    // MARK: - Message Generators

    static func generateDMMessages(with user: User) -> [Message] {
        [
            Message(id: "dm-\(user.id)-1", userId: user.id, content: "Hey! How's the project going?", timestamp: Date().addingTimeInterval(-7200)),
            Message(id: "dm-\(user.id)-2", userId: "current", content: "Going well! Just finished the new feature implementation.", timestamp: Date().addingTimeInterval(-7000)),
            Message(id: "dm-\(user.id)-3", userId: user.id, content: "That's great. Can you walk me through the changes?", timestamp: Date().addingTimeInterval(-6800)),
            Message(id: "dm-\(user.id)-4", userId: "current", content: "Sure! Here's the architecture doc and the homepage redesign mockup.", timestamp: Date().addingTimeInterval(-6600), attachments: [
                MessageAttachment(type: .document, name: "Q1 2026 Company Goals", docEmoji: "🎯", docAuthor: "Alex Rivera", docLastModified: Date().addingTimeInterval(-86400)),
                MessageAttachment(type: .image, name: "homepage-redesign-v2.png", size: "1.6 MB", mimeType: "image/png"),
            ]),
            Message(id: "dm-\(user.id)-5", userId: user.id, content: "Looks great! Here's the design walkthrough recording.", timestamp: Date().addingTimeInterval(-6400), attachments: [
                MessageAttachment(type: .video, name: "design-walkthrough.mp4", size: "42.1 MB", mimeType: "video/mp4", videoDuration: "5:17"),
            ]),
            Message(id: "dm-\(user.id)-6", userId: "current", content: "Perfect. I also wanted to discuss the timeline for next sprint.", timestamp: Date().addingTimeInterval(-6200)),
            Message(id: "dm-\(user.id)-7", userId: user.id, content: "Sounds good! Looking forward to it 👍", timestamp: Date().addingTimeInterval(-6000), reactions: [Reaction(emoji: "👍", users: ["current"], count: 1)]),
            Message(id: "dm-\(user.id)-8", userId: "current", content: "See you then! 🙌", timestamp: Date().addingTimeInterval(-5800)),
        ]
    }

    static func generateGroupMessages() -> [Message] {
        [
            Message(id: "gm-1", userId: "u1", content: "Team, we need to finalize the component migration plan by Friday.", timestamp: Date().addingTimeInterval(-3600)),
            Message(id: "gm-2", userId: "u6", content: "I've started migrating the Button and Input components. Should be done by tomorrow.", timestamp: Date().addingTimeInterval(-3400), threadReplies: [
                Message(id: "gm-2-t1", userId: "u2", content: "Nice! Are you following the new design tokens?", timestamp: Date().addingTimeInterval(-3300)),
                Message(id: "gm-2-t2", userId: "u6", content: "Yes, all mapped to the new system. Here's the token spec.", timestamp: Date().addingTimeInterval(-3200), attachments: [
                    MessageAttachment(type: .file, name: "design-tokens-v2.json", size: "12 KB", mimeType: "application/json"),
                ]),
                Message(id: "gm-2-t3", userId: "u2", content: "Perfect, looks aligned with Figma. 👍", timestamp: Date().addingTimeInterval(-3100)),
            ]),
            Message(id: "gm-3", userId: "u2", content: "The new design tokens are ready. I'll share the Figma link.", timestamp: Date().addingTimeInterval(-3200), attachments: [
                MessageAttachment(type: .image, name: "design-tokens-preview.png", size: "890 KB", mimeType: "image/png"),
                MessageAttachment(type: .document, name: "Design System Tokens", docEmoji: "🎨", docAuthor: "Jordan Lee", docLastModified: Date().addingTimeInterval(-259200)),
            ]),
            Message(id: "gm-4", userId: "current", content: "Great progress! I'll handle the Card and Modal components.", timestamp: Date().addingTimeInterval(-3000)),
            Message(id: "gm-5", userId: "u1", content: "Perfect. Let's sync on the remaining components in tomorrow's standup.", timestamp: Date().addingTimeInterval(-2800), reactions: [Reaction(emoji: "✅", users: ["current", "u6", "u2"], count: 3)]),
            Message(id: "gm-6", userId: "u6", content: "Should we also update the documentation as we go?", timestamp: Date().addingTimeInterval(-2600)),
            Message(id: "gm-7", userId: "current", content: "Yes, let's update the Storybook stories alongside the migration.", timestamp: Date().addingTimeInterval(-2400)),
        ]
    }

    static func generateChannelMessages() -> [Message] {
        [
            // Performance issue with video attachment
            Message(id: "ch-1", userId: "u3", content: "Seeing some latency spikes on the search endpoint after last deploy. Here's a screen recording of the issue.", timestamp: Date().addingTimeInterval(-3600), attachments: [
                MessageAttachment(type: .video, name: "api-latency-screenrec.mp4", size: "18.4 MB", mimeType: "video/mp4", videoDuration: "2:34"),
            ], threadReplies: [
                Message(id: "ch-1-t1", userId: "u5", content: "I can take a look at the logs. Which endpoint exactly?", timestamp: Date().addingTimeInterval(-3500)),
                Message(id: "ch-1-t2", userId: "u3", content: "The `/api/v2/users/search` endpoint. P95 latency spiked to 1.2s after the last deploy.", timestamp: Date().addingTimeInterval(-3400)),
                Message(id: "ch-1-t3", userId: "u5", content: "Looks like the new query planner is choosing a seq scan... Missing index on `display_name`.", timestamp: Date().addingTimeInterval(-3300), reactions: [Reaction(emoji: "🔍", users: ["u3"], count: 1)]),
                Message(id: "ch-1-t4", userId: "u1", content: "Can we add the index in a non-blocking migration?", timestamp: Date().addingTimeInterval(-3200)),
                Message(id: "ch-1-t5", userId: "u5", content: "Yes — `CREATE INDEX CONCURRENTLY` will handle it.", timestamp: Date().addingTimeInterval(-3100)),
                Message(id: "ch-1-t6", userId: "u3", content: "PR is up: #482. Marking this resolved for now.", timestamp: Date().addingTimeInterval(-3000), reactions: [Reaction(emoji: "✅", users: ["u1", "u5"], count: 2)]),
            ]),

            // Design mockups with multiple images
            Message(id: "ch-2", userId: "u2", content: "Here are the updated dashboard mockups from today's design review.", timestamp: Date().addingTimeInterval(-2800), reactions: [Reaction(emoji: "🔥", users: ["u1", "u3"], count: 2), Reaction(emoji: "👀", users: ["u4"], count: 1)], attachments: [
                MessageAttachment(type: .image, name: "dashboard-mockup-v3.png", size: "2.4 MB", mimeType: "image/png"),
                MessageAttachment(type: .image, name: "whiteboard-session.jpg", size: "1.8 MB", mimeType: "image/jpeg"),
                MessageAttachment(type: .image, name: "mobile-wireframes.png", size: "3.1 MB", mimeType: "image/png"),
            ]),

            // File attachments — RFC, build artifacts, benchmarks
            Message(id: "ch-3", userId: "u1", content: "Uploading the latest build artifacts and the RFC for the new auth flow.", timestamp: Date().addingTimeInterval(-2400), attachments: [
                MessageAttachment(type: .file, name: "auth-flow-rfc-v2.pdf", size: "842 KB", mimeType: "application/pdf"),
                MessageAttachment(type: .file, name: "build-report-2026-02-14.zip", size: "14.3 MB", mimeType: "application/zip"),
                MessageAttachment(type: .file, name: "api-benchmarks.xlsx", size: "256 KB", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            ]),

            Message(id: "ch-4", userId: "current", content: "I've verified the new endpoints are responding correctly. LGTM! 👍", timestamp: Date().addingTimeInterval(-2000)),

            // Task + document link
            Message(id: "ch-5", userId: "u5", content: "FYI — linked the relevant task and the architecture doc here. The OAuth migration is blocked by the infra ticket.", timestamp: Date().addingTimeInterval(-1600), reactions: [Reaction(emoji: "👍", users: ["u1"], count: 1)], attachments: [
                MessageAttachment(type: .task, name: "Implement OAuth 2.0 flow", taskId: "ENG-341", taskStatus: "In Progress", taskPriority: "High", taskAssignee: "Casey Zhang"),
                MessageAttachment(type: .document, name: "API Architecture Guide", docEmoji: "🏗️", docAuthor: "Casey Zhang", docLastModified: Date().addingTimeInterval(-172800)),
            ], threadReplies: [
                Message(id: "ch-5-t1", userId: "u3", content: "I can help unblock the infra side. The Terraform module just needs the new IAM role added.", timestamp: Date().addingTimeInterval(-1500)),
                Message(id: "ch-5-t2", userId: "u1", content: "That would be great — the OAuth flow is mostly done but we need the callback URL whitelisted on the load balancer too.", timestamp: Date().addingTimeInterval(-1400)),
                Message(id: "ch-5-t3", userId: "u5", content: "Done! IAM role created and callback URL added to ALB. You should be unblocked now.", timestamp: Date().addingTimeInterval(-1300), reactions: [Reaction(emoji: "🎉", users: ["u1", "u3"], count: 2)]),
            ]),

            // Perf graph + bug task
            Message(id: "ch-6", userId: "u3", content: "Quick screenshot of the perf regression. Also attaching the HAR trace and the related bug ticket.", timestamp: Date().addingTimeInterval(-1200), reactions: [Reaction(emoji: "🐛", users: ["u1", "u5"], count: 2)], attachments: [
                MessageAttachment(type: .image, name: "latency-graph-feb14.png", size: "420 KB", mimeType: "image/png"),
                MessageAttachment(type: .file, name: "checkout-flow-trace.har", size: "1.2 MB", mimeType: "application/json"),
                MessageAttachment(type: .task, name: "P95 latency regression on /checkout", taskId: "ENG-356", taskStatus: "To Do", taskPriority: "Critical", taskAssignee: "Morgan Kim"),
            ]),

            // Deployment success
            Message(id: "ch-7", userId: "u3", content: "Promoting to production now. ETA: 10 minutes.", timestamp: Date().addingTimeInterval(-1000), isPinned: true),
            Message(id: "ch-8", userId: "u4", content: "All regression tests passed. Good to go!", timestamp: Date().addingTimeInterval(-800)),
            Message(id: "ch-9", userId: "u3", content: "Production deployment complete ✅ v2.4.1 is live!", timestamp: Date().addingTimeInterval(-600), reactions: [Reaction(emoji: "🚀", users: ["u1", "u4", "u5", "current"], count: 4), Reaction(emoji: "👏", users: ["u2", "u6"], count: 2)]),
        ]
    }
}
