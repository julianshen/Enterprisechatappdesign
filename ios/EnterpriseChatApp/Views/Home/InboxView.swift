import SwiftUI

struct InboxView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var activeTab: InboxTab = .notifications
    @State private var notifFilter: NotifFilter = .all
    @State private var requestFilter: RequestFilter = .all
    @State private var notifications = MockData.notifications
    @State private var submitted: Set<String> = []

    enum InboxTab: String, CaseIterable {
        case notifications = "Notifications"
        case requests = "My Requests"
    }

    enum NotifFilter: String, CaseIterable {
        case all = "All"
        case unread = "Unread"
    }

    enum RequestFilter: String, CaseIterable {
        case all = "All"
        case pendingOwner = "Owner"
        case pendingAdmin = "Admin"
        case approved = "Approved"
        case rejected = "Rejected"

        var status: SpaceRequestStatus? {
            switch self {
            case .all: return nil
            case .pendingOwner: return .pendingOwner
            case .pendingAdmin: return .pendingAdmin
            case .approved: return .approved
            case .rejected: return .rejected
            }
        }
    }

    private var unreadCount: Int {
        notifications.filter { !$0.read }.count
    }

    private var pendingRequestCount: Int {
        MockData.spaceRequests.filter { $0.status == .pendingOwner || $0.status == .pendingAdmin }.count
    }

    private var filteredNotifications: [AppNotification] {
        notifFilter == .unread ? notifications.filter { !$0.read } : notifications
    }

    private var filteredRequests: [SpaceRequest] {
        guard let status = requestFilter.status else { return MockData.spaceRequests }
        return MockData.spaceRequests.filter { $0.status == status }
    }

    private func markAllRead() {
        withAnimation {
            for i in notifications.indices { notifications[i].read = true }
        }
    }

    private func markAsRead(_ id: String) {
        if let idx = notifications.firstIndex(where: { $0.id == id }) {
            notifications[idx].read = true
        }
    }

    var body: some View {
        ZStack {
            MeshBackgroundView()

            VStack(spacing: 0) {
                // Tab bar
                tabBar

                // Filter bar
                if activeTab == .notifications {
                    notificationFilterBar
                } else {
                    requestFilterBar
                }

                // Content
                if activeTab == .notifications {
                    notificationsList
                } else {
                    requestsList
                }
            }
        }
        .navigationTitle("Inbox")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if activeTab == .notifications && unreadCount > 0 {
                    Button {
                        markAllRead()
                    } label: {
                        Image(systemName: "checkmark.message.fill")
                            .font(.subheadline)
                            .foregroundStyle(Color(hex: "6C63FF"))
                    }
                }
            }
        }
    }

    // MARK: - Tab Bar

    private var tabBar: some View {
        HStack(spacing: 0) {
            tabButton(.notifications, icon: "bell.fill", badge: unreadCount)
            tabButton(.requests, icon: "building.2.fill", badge: pendingRequestCount)
        }
        .padding(.horizontal)
        .padding(.top, 4)
    }

    private func tabButton(_ tab: InboxTab, icon: String, badge: Int) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) { activeTab = tab }
        } label: {
            VStack(spacing: 6) {
                HStack(spacing: 5) {
                    Image(systemName: icon)
                        .font(.caption2)
                    Text(tab.rawValue)
                        .font(.caption)
                        .fontWeight(.semibold)
                    if badge > 0 {
                        Text("\(badge)")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(
                                tab == .notifications
                                    ? Color(hex: "FF3B30")
                                    : Color(hex: "FF9F0A"),
                                in: Capsule()
                            )
                    }
                }
                .foregroundStyle(activeTab == tab ? Color(hex: "6C63FF") : .secondary)

                Rectangle()
                    .fill(activeTab == tab ? Color(hex: "6C63FF") : .clear)
                    .frame(height: 2)
                    .cornerRadius(1)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Notification Filter Bar

    private var notificationFilterBar: some View {
        HStack(spacing: 6) {
            ForEach(NotifFilter.allCases, id: \.self) { filter in
                Button {
                    withAnimation { notifFilter = filter }
                } label: {
                    Text(filter.rawValue)
                        .font(.caption2)
                        .fontWeight(.medium)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            notifFilter == filter
                                ? .ultraThinMaterial
                                : .ultraThinMaterial,
                            in: RoundedRectangle(cornerRadius: 8)
                        )
                        .overlay {
                            if notifFilter == filter {
                                RoundedRectangle(cornerRadius: 8)
                                    .strokeBorder(Color(hex: "6C63FF").opacity(0.3), lineWidth: 0.5)
                            }
                        }
                        .foregroundStyle(notifFilter == filter ? .primary : .secondary)
                }
                .buttonStyle(.plain)
            }
            Spacer()
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    // MARK: - Request Filter Bar

    private var requestFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(RequestFilter.allCases, id: \.self) { filter in
                    let count = filter == .all
                        ? MockData.spaceRequests.count
                        : MockData.spaceRequests.filter { $0.status == filter.status }.count
                    Button {
                        withAnimation { requestFilter = filter }
                    } label: {
                        HStack(spacing: 4) {
                            if let status = filter.status {
                                Circle()
                                    .fill(status.color)
                                    .frame(width: 6, height: 6)
                            }
                            Text(filter.rawValue)
                                .font(.caption2)
                                .fontWeight(.medium)
                            if count > 0 {
                                Text("\(count)")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            requestFilter == filter
                                ? .ultraThinMaterial
                                : .ultraThinMaterial,
                            in: RoundedRectangle(cornerRadius: 8)
                        )
                        .overlay {
                            if requestFilter == filter {
                                RoundedRectangle(cornerRadius: 8)
                                    .strokeBorder(Color(hex: "6C63FF").opacity(0.3), lineWidth: 0.5)
                            }
                        }
                        .foregroundStyle(requestFilter == filter ? .primary : .secondary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 8)
    }

    // MARK: - Notifications List

    private var notificationsList: some View {
        Group {
            if filteredNotifications.isEmpty {
                emptyState(
                    icon: "checkmark.circle.fill",
                    iconColor: Color(hex: "34C759"),
                    title: "You're all caught up!",
                    subtitle: "No unread notifications"
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(filteredNotifications) { notif in
                            NavigationLink(destination: NotificationDetailView(
                                notification: notif,
                                isSubmitted: submitted.contains(notif.id),
                                onSubmit: { submitted.insert(notif.id) }
                            ).onAppear { markAsRead(notif.id) }) {
                                NotificationRow(
                                    notification: notif,
                                    isSubmitted: submitted.contains(notif.id)
                                )
                            }
                            .buttonStyle(.plain)

                            if notif.id != filteredNotifications.last?.id {
                                Divider().opacity(0.3).padding(.leading, 56)
                            }
                        }
                    }
                    .glassCard(padding: 0)
                    .padding(.horizontal)
                    .padding(.top, 4)
                }
            }
        }
    }

    // MARK: - Requests List

    private var requestsList: some View {
        Group {
            if filteredRequests.isEmpty {
                emptyState(
                    icon: "building.2.fill",
                    iconColor: .secondary,
                    title: "No requests found",
                    subtitle: requestFilter == .all
                        ? "Use \"Add space\" to request a new space."
                        : "No requests match this filter."
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(filteredRequests) { request in
                            NavigationLink(destination: SpaceRequestDetailView(request: request)) {
                                SpaceRequestRow(request: request)
                            }
                            .buttonStyle(.plain)

                            if request.id != filteredRequests.last?.id {
                                Divider().opacity(0.3).padding(.leading, 56)
                            }
                        }
                    }
                    .glassCard(padding: 0)
                    .padding(.horizontal)
                    .padding(.top, 4)
                }
            }
        }
    }

    // MARK: - Empty State

    private func emptyState(icon: String, iconColor: Color, title: String, subtitle: String) -> some View {
        VStack(spacing: 12) {
            Spacer()
            Image(systemName: icon)
                .font(.system(size: 36))
                .foregroundStyle(iconColor)
                .shadow(color: iconColor.opacity(0.3), radius: 6)
            Text(title)
                .font(.subheadline)
                .fontWeight(.semibold)
            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Notification Row

struct NotificationRow: View {
    let notification: AppNotification
    let isSubmitted: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            // Unread dot
            Circle()
                .fill(notification.read ? .clear : Color(hex: "6C63FF"))
                .frame(width: 8, height: 8)
                .padding(.top, 8)

            // Type icon
            Image(systemName: notification.typeConfig.icon)
                .font(.caption)
                .foregroundStyle(notification.typeConfig.color)
                .frame(width: 32, height: 32)
                .background(notification.typeConfig.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))

            // Content
            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(notification.title)
                        .font(.subheadline)
                        .fontWeight(notification.read ? .regular : .semibold)
                        .lineLimit(1)
                    Spacer()
                    Text(notification.timestamp.shortTimeString)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                Text(notification.message)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                HStack(spacing: 6) {
                    // Category badge
                    Text(notification.typeConfig.label)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(notification.typeConfig.color)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(notification.typeConfig.color.opacity(0.12), in: Capsule())

                    // Action required / submitted badge
                    if notification.formFields != nil && !isSubmitted {
                        Text("Action Required")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(Color(hex: "FF9F0A"))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(hex: "FF9F0A").opacity(0.12), in: Capsule())
                    }
                    if isSubmitted {
                        Text("Submitted")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(Color(hex: "34C759"))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(hex: "34C759").opacity(0.12), in: Capsule())
                    }
                }
                .padding(.top, 2)
            }

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .padding(.top, 8)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}

// MARK: - Space Request Row

struct SpaceRequestRow: View {
    let request: SpaceRequest

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            // Status dot
            Circle()
                .fill(
                    (request.status == .pendingOwner || request.status == .pendingAdmin)
                        ? request.status.color : .clear
                )
                .frame(width: 8, height: 8)
                .padding(.top, 8)

            // Gradient icon
            Image(systemName: "building.2.fill")
                .font(.caption)
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(
                    LinearGradient(
                        colors: [Color(hex: request.scenarioColor), Color(hex: request.scenarioColor).opacity(0.8)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    in: RoundedRectangle(cornerRadius: 8)
                )

            // Content
            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(request.spaceName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .lineLimit(1)
                    Spacer()
                    Text(request.createdAt.shortTimeString)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                Text("\(request.scenarioName) · Owner: \(request.ownerName)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    // Status badge
                    HStack(spacing: 3) {
                        Image(systemName: request.status.icon)
                            .font(.system(size: 8))
                        Text(request.status.label)
                    }
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(request.status.color)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(request.status.color.opacity(0.12), in: Capsule())

                    // Counts
                    HStack(spacing: 4) {
                        Label("\(request.channelCount)", systemImage: "number")
                        Text("·")
                        Label("\(request.dashboardCount)", systemImage: "chart.bar.xaxis")
                        Text("·")
                        Label("\(request.appCount)", systemImage: "shippingbox")
                    }
                    .font(.system(size: 9))
                    .foregroundStyle(.tertiary)
                }
                .padding(.top, 2)
            }

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .padding(.top, 8)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}

// MARK: - Notification Detail View

struct NotificationDetailView: View {
    let notification: AppNotification
    let isSubmitted: Bool
    let onSubmit: () -> Void
    @EnvironmentObject var theme: ThemeManager
    @State private var formValues: [String: String] = [:]

    var body: some View {
        ZStack {
            MeshBackgroundView()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Meta row
                    HStack(spacing: 8) {
                        Text(notification.typeConfig.label)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundStyle(notification.typeConfig.color)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(notification.typeConfig.color.opacity(0.12), in: Capsule())

                        Text(notification.timestamp.formattedTimestamp)
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        if let from = notification.from {
                            Text("·").foregroundStyle(.tertiary)
                            Text("From \(from)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    // Body card
                    Text(notification.detail)
                        .font(.subheadline)
                        .lineSpacing(4)
                        .foregroundStyle(.primary.opacity(0.85))
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .glassCard()

                    // Form section
                    if let fields = notification.formFields, !isSubmitted {
                        VStack(alignment: .leading, spacing: 14) {
                            HStack(spacing: 6) {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundStyle(Color(hex: "6C63FF"))
                                Text("Your Response")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                            }

                            ForEach(fields) { field in
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack(spacing: 2) {
                                        Text(field.label)
                                            .font(.caption)
                                            .fontWeight(.medium)
                                        if field.required {
                                            Text("*")
                                                .font(.caption)
                                                .foregroundStyle(.red)
                                        }
                                    }

                                    switch field.type {
                                    case .select:
                                        Picker(field.label, selection: Binding(
                                            get: { formValues[field.label] ?? "" },
                                            set: { formValues[field.label] = $0 }
                                        )) {
                                            Text("Select...").tag("")
                                            ForEach(field.options ?? [], id: \.self) { opt in
                                                Text(opt).tag(opt)
                                            }
                                        }
                                        .pickerStyle(.menu)
                                        .padding(10)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                                        .overlay {
                                            RoundedRectangle(cornerRadius: 10)
                                                .strokeBorder(theme.glassBorder.opacity(0.3), lineWidth: 0.5)
                                        }

                                    case .textarea:
                                        TextField("Enter \(field.label.lowercased())...", text: Binding(
                                            get: { formValues[field.label] ?? "" },
                                            set: { formValues[field.label] = $0 }
                                        ), axis: .vertical)
                                        .lineLimit(3...6)
                                        .font(.subheadline)
                                        .padding(10)
                                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                                        .overlay {
                                            RoundedRectangle(cornerRadius: 10)
                                                .strokeBorder(theme.glassBorder.opacity(0.3), lineWidth: 0.5)
                                        }

                                    case .text:
                                        TextField("Enter \(field.label.lowercased())...", text: Binding(
                                            get: { formValues[field.label] ?? "" },
                                            set: { formValues[field.label] = $0 }
                                        ))
                                        .font(.subheadline)
                                        .padding(10)
                                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                                        .overlay {
                                            RoundedRectangle(cornerRadius: 10)
                                                .strokeBorder(theme.glassBorder.opacity(0.3), lineWidth: 0.5)
                                        }
                                    }
                                }
                            }

                            Button {
                                onSubmit()
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "paperplane.fill")
                                    Text("Submit")
                                }
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundStyle(.white)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 12)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6")],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    ),
                                    in: RoundedRectangle(cornerRadius: 12)
                                )
                                .shadow(color: Color(hex: "6C63FF").opacity(0.3), radius: 6, y: 2)
                            }
                        }
                        .padding(16)
                        .glassCard()
                    }

                    // Submitted confirmation
                    if notification.formFields != nil && isSubmitted {
                        HStack(spacing: 12) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.title3)
                                .foregroundStyle(Color(hex: "34C759"))
                                .shadow(color: Color(hex: "34C759").opacity(0.3), radius: 4)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Response submitted")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(Color(hex: "34C759"))
                                Text("Your response has been recorded")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(hex: "34C759").opacity(0.08), in: RoundedRectangle(cornerRadius: 14))
                        .overlay {
                            RoundedRectangle(cornerRadius: 14)
                                .strokeBorder(Color(hex: "34C759").opacity(0.2), lineWidth: 0.5)
                        }
                    }
                }
                .padding()
            }
        }
        .navigationTitle(notification.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Space Request Detail View

struct SpaceRequestDetailView: View {
    let request: SpaceRequest
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        ZStack {
            MeshBackgroundView()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Status + meta
                    HStack(spacing: 8) {
                        HStack(spacing: 4) {
                            Image(systemName: request.status.icon)
                                .font(.system(size: 10))
                            Text(request.status.label)
                        }
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(request.status.color)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(request.status.color.opacity(0.12), in: Capsule())

                        Text("Submitted \(request.createdAt.formattedTimestamp)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }

                    // Space card
                    spaceCard

                    // Included items
                    includedItemsGrid

                    // Permissions
                    permissionsCard

                    // Rejection reason
                    if request.status == .rejected, let reason = request.rejectionReason {
                        rejectionCard(reason: reason)
                    }

                    // Approval timeline
                    approvalTimeline
                }
                .padding()
            }
        }
        .navigationTitle(request.spaceName)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var spaceCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Gradient header
            ZStack(alignment: .bottomLeading) {
                LinearGradient(
                    colors: [Color(hex: request.scenarioColor), Color(hex: request.scenarioColor).opacity(0.7)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 56)

                Image(systemName: "building.2.fill")
                    .font(.body)
                    .foregroundStyle(.white)
                    .frame(width: 32, height: 32)
                    .background(.white.opacity(0.2), in: RoundedRectangle(cornerRadius: 8))
                    .overlay {
                        RoundedRectangle(cornerRadius: 8)
                            .strokeBorder(.white.opacity(0.3), lineWidth: 0.5)
                    }
                    .padding(.leading, 14)
                    .offset(y: 8)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(request.spaceName)
                    .font(.headline)
                    .fontWeight(.bold)
                Text(request.spaceDescription)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineSpacing(2)

                HStack(spacing: 10) {
                    infoTile("Scenario", value: request.scenarioName)
                    infoTile("Owner", value: request.ownerName, subtitle: request.ownerTitle)
                }
            }
            .padding(14)
            .padding(.top, 6)
        }
        .glassCard(cornerRadius: 16, padding: 0)
    }

    private func infoTile(_ label: String, value: String, subtitle: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(.tertiary)
                .tracking(0.5)
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
            if let sub = subtitle {
                Text(sub)
                    .font(.system(size: 9))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
    }

    private var includedItemsGrid: some View {
        HStack(alignment: .top, spacing: 8) {
            includedItemCard(icon: "number", label: "Channels", count: request.channelCount, items: request.channels)
            includedItemCard(icon: "chart.bar.xaxis", label: "Dashboards", count: request.dashboardCount, items: request.dashboards)
            includedItemCard(icon: "shippingbox", label: "Apps", count: request.appCount, items: request.apps)
        }
    }

    private func includedItemCard(icon: String, label: String, count: Int, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 10))
                    .foregroundStyle(Color(hex: "6C63FF"))
                Text("\(count) \(label)")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(.tertiary)
                    .textCase(.uppercase)
            }
            if items.isEmpty {
                Text("None")
                    .font(.system(size: 10))
                    .foregroundStyle(.tertiary)
                    .italic()
            } else {
                ForEach(items, id: \.self) { item in
                    Text(item)
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard(cornerRadius: 12, padding: 0)
        .padding(.vertical, 2) // inner padding workaround
    }

    private var permissionsCard: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: "shield.fill")
                    .font(.system(size: 10))
                    .foregroundStyle(Color(hex: "6C63FF"))
                Text("PERMISSIONS")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(.tertiary)
                    .tracking(0.5)
            }
            Text(request.permissions)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineSpacing(2)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard(cornerRadius: 12, padding: 0)
    }

    private func rejectionCard(reason: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(Color(hex: "FF3B30"))
                Text("Rejected by \(request.rejectedBy ?? "Admin")")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color(hex: "FF3B30"))
            }
            Text(reason)
                .font(.caption)
                .foregroundStyle(Color(hex: "FF3B30").opacity(0.8))
                .lineSpacing(2)
            if let rejectedAt = request.rejectedAt {
                Text(rejectedAt.formattedTimestamp)
                    .font(.caption2)
                    .foregroundStyle(Color(hex: "FF3B30").opacity(0.5))
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(hex: "FF3B30").opacity(0.06), in: RoundedRectangle(cornerRadius: 14))
        .overlay {
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(Color(hex: "FF3B30").opacity(0.15), lineWidth: 0.5)
        }
    }

    private var approvalTimeline: some View {
        let isOwnerSelf = request.ownerName == request.requesterName
        let steps = buildTimelineSteps(isOwnerSelf: isOwnerSelf)

        return VStack(alignment: .leading, spacing: 0) {
            Text("APPROVAL TIMELINE")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(Color(hex: "6C63FF"))
                .tracking(0.5)
                .padding(.bottom, 14)

            ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .top, spacing: 12) {
                    // Timeline indicator
                    VStack(spacing: 0) {
                        Circle()
                            .fill(step.statusColor)
                            .frame(width: 28, height: 28)
                            .overlay {
                                Image(systemName: step.statusIcon)
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundStyle(.white)
                            }
                            .shadow(color: step.statusColor.opacity(0.3), radius: 3)

                        if index < steps.count - 1 {
                            Rectangle()
                                .fill(step.isDone ? Color(hex: "34C759") : Color.secondary.opacity(0.2))
                                .frame(width: 2, height: 36)
                        }
                    }

                    // Step content
                    VStack(alignment: .leading, spacing: 2) {
                        Text(step.label)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(step.isDone || step.isCurrent ? .primary : .tertiary)
                        Text(step.sublabel)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                        if let date = step.date {
                            Text(date.formattedTimestamp)
                                .font(.system(size: 9))
                                .foregroundStyle(.quaternary)
                        }
                        if step.isCurrent {
                            HStack(spacing: 3) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 8))
                                Text("Waiting for response")
                                    .font(.system(size: 9, weight: .semibold))
                            }
                            .foregroundStyle(Color(hex: "FF9F0A"))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color(hex: "FF9F0A").opacity(0.1), in: Capsule())
                            .padding(.top, 2)
                        }
                    }
                    .padding(.bottom, index < steps.count - 1 ? 12 : 0)
                }
            }
        }
        .padding(16)
        .glassCard()
    }

    private struct TimelineStep {
        let label: String
        let sublabel: String
        let date: Date?
        let isDone: Bool
        let isCurrent: Bool
        let isRejected: Bool

        var statusColor: Color {
            if isDone { return Color(hex: "34C759") }
            if isCurrent { return Color(hex: "FF9F0A") }
            if isRejected { return Color(hex: "FF3B30") }
            return Color(hex: "8E8E93").opacity(0.4)
        }

        var statusIcon: String {
            if isDone { return "checkmark" }
            if isCurrent { return "clock.fill" }
            if isRejected { return "xmark" }
            return "circle"
        }
    }

    private func buildTimelineSteps(isOwnerSelf: Bool) -> [TimelineStep] {
        var steps: [TimelineStep] = []

        // Step 1: Submitted
        steps.append(TimelineStep(
            label: "Request Submitted",
            sublabel: "by \(request.requesterName)",
            date: request.createdAt,
            isDone: true,
            isCurrent: false,
            isRejected: false
        ))

        // Step 2: Owner Approval (skip if owner is self)
        if !isOwnerSelf {
            let ownerDone = request.ownerApprovedAt != nil
            let ownerRejected = request.status == .rejected && request.rejectedBy == request.ownerName
            let ownerCurrent = request.status == .pendingOwner
            steps.append(TimelineStep(
                label: "Owner Approval",
                sublabel: request.ownerName,
                date: request.ownerApprovedAt,
                isDone: ownerDone,
                isCurrent: ownerCurrent,
                isRejected: ownerRejected
            ))
        }

        // Step 3: Admin Approval
        let adminDone = request.adminApprovedAt != nil
        let adminRejected = request.status == .rejected && (request.rejectedBy != request.ownerName || isOwnerSelf)
        let adminCurrent = request.status == .pendingAdmin
        steps.append(TimelineStep(
            label: "Admin Approval",
            sublabel: "System Admin",
            date: request.adminApprovedAt,
            isDone: adminDone,
            isCurrent: adminCurrent,
            isRejected: adminRejected
        ))

        // Step 4: Space Created
        steps.append(TimelineStep(
            label: "Space Created",
            sublabel: request.status == .approved ? "Live" : "Pending",
            date: request.status == .approved ? request.adminApprovedAt : nil,
            isDone: request.status == .approved,
            isCurrent: false,
            isRejected: false
        ))

        return steps
    }
}

// MARK: - Date Extensions for Inbox

extension Date {
    var shortTimeString: String {
        let calendar = Calendar.current
        if calendar.isDateInToday(self) {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return formatter.string(from: self)
        }
        if calendar.isDateInYesterday(self) { return "Yesterday" }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: self)
    }

    var formattedTimestamp: String {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        if calendar.isDateInToday(self) {
            formatter.dateFormat = "'Today at' h:mm a"
        } else if calendar.isDateInYesterday(self) {
            formatter.dateFormat = "'Yesterday at' h:mm a"
        } else {
            formatter.dateFormat = "MMM d, h:mm a"
        }
        return formatter.string(from: self)
    }
}
