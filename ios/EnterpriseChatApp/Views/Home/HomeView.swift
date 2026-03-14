import SwiftUI

struct HomeView: View {
    @EnvironmentObject var theme: ThemeManager
    @EnvironmentObject var appState: AppState

    private var pendingCount: Int { MockData.notifications.filter { $0.formFields != nil && !$0.read }.count }
    private var meetingCount: Int { MockData.meetings.filter { $0.status != .completed }.count }
    private var unreadTotal: Int { MockData.unreadChannels.reduce(0) { $0 + $1.count } }
    private var taskCount: Int { 5 } // mock open tasks

    var body: some View {
        NavigationStack {
            ZStack {
                MeshBackgroundView()

                ScrollView {
                    VStack(spacing: 16) {
                        greetingHeader
                        quickStatsChips
                        calendarWidget
                        meetingsWidget
                        servicesWidget
                        approvalsWidget
                        unreadChannelsWidget
                        activeThreadsWidget
                    }
                    .padding(.vertical, 8)
                }
            }
            .navigationTitle("My Dashboard")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: InboxView()) {
                        Image(systemName: "bell")
                            .fontWeight(.medium)
                            .overlay(alignment: .topTrailing) {
                                let count = MockData.notifications.filter { !$0.read }.count
                                if count > 0 {
                                    Circle()
                                        .fill(Color(hex: "FF453A"))
                                        .frame(width: 8, height: 8)
                                        .shadow(color: Color(hex: "FF453A").opacity(0.5), radius: 3)
                                        .offset(x: 2, y: -2)
                                }
                            }
                    }
                }
            }
        }
    }

    // MARK: - Greeting Header

    private var greetingHeader: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(greetingText)
                .font(.title2)
                .fontWeight(.bold)
            Text("\(Date().formatted(.dateTime.weekday(.wide).month(.wide).day())) — Here's what needs your attention.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .glassCardTinted(Color(hex: "6C63FF"))
        .padding(.horizontal)
    }

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let firstName = appState.currentUser.name.components(separatedBy: " ").first ?? ""
        switch hour {
        case 5..<12: return "Good morning, \(firstName)"
        case 12..<17: return "Good afternoon, \(firstName)"
        default: return "Good evening, \(firstName)"
        }
    }

    // MARK: - Quick Stats Chips

    private var quickStatsChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                if meetingCount > 0 {
                    QuickChip(icon: "video.fill", text: "\(meetingCount) meeting\(meetingCount > 1 ? "s" : "") ahead", color: Color(hex: "0078D4"))
                }
                if pendingCount > 0 {
                    NavigationLink(destination: InboxView()) {
                        QuickChip(icon: "checkmark.seal.fill", text: "\(pendingCount) pending approval\(pendingCount > 1 ? "s" : "")", color: Color(hex: "FF9F0A"))
                    }
                    .buttonStyle(.plain)
                }
                if taskCount > 0 {
                    QuickChip(icon: "checkmark.square.fill", text: "\(taskCount) open task\(taskCount > 1 ? "s" : "")", color: Color(hex: "6C63FF"))
                }
                if unreadTotal > 0 {
                    QuickChip(icon: "envelope.fill", text: "\(unreadTotal) unread message\(unreadTotal > 1 ? "s" : "")", color: Color(hex: "34C759"))
                }
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Calendar Widget

    private var calendarWidget: some View {
        WidgetCard(title: "Working Calendar", icon: "calendar", color: Color(hex: "6C63FF")) {
            CalendarWidgetContent()
        }
    }

    // MARK: - Meetings Widget

    private var meetingsWidget: some View {
        let upcoming = MockData.meetings.filter { $0.status != .completed }.prefix(5)
        return WidgetCard(title: "Incoming Meetings", icon: "video.fill", color: Color(hex: "0078D4")) {
            if upcoming.isEmpty {
                Text("No upcoming meetings")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(upcoming)) { meeting in
                        MeetingRow(meeting: meeting)
                        if meeting.id != upcoming.last?.id {
                            Divider().opacity(0.3).padding(.leading, 60)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Services Widget

    private var servicesWidget: some View {
        WidgetCard(title: "Common Services", icon: "square.grid.3x3.fill", color: Color(hex: "6C63FF")) {
            ServicesGrid()
        }
    }

    // MARK: - Approvals Widget

    private var approvalsWidget: some View {
        let pending = MockData.notifications.filter { $0.formFields != nil && !$0.read }.prefix(4)
        return WidgetCard(title: "Pending Approvals", icon: "checkmark.seal.fill", color: Color(hex: "FF9F0A")) {
            if pending.isEmpty {
                Text("No pending approvals")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(pending)) { notif in
                        NavigationLink(destination: InboxView()) {
                            ApprovalRow(notification: notif)
                        }
                        .buttonStyle(.plain)
                        if notif.id != pending.last?.id {
                            Divider().opacity(0.3).padding(.leading, 48)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Unread Channels Widget

    private var unreadChannelsWidget: some View {
        WidgetCard(title: "Unread Channels", icon: "number", color: Color(hex: "34C759")) {
            if MockData.unreadChannels.isEmpty {
                Text("All caught up!")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                VStack(spacing: 0) {
                    ForEach(MockData.unreadChannels) { ch in
                        UnreadChannelRow(channel: ch)
                        if ch.id != MockData.unreadChannels.last?.id {
                            Divider().opacity(0.3).padding(.leading, 48)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Active Threads Widget

    private var activeThreadsWidget: some View {
        WidgetCard(title: "Active Threads", icon: "bubble.left.and.text.bubble.right.fill", color: Color(hex: "FF3B30")) {
            if MockData.activeThreads.isEmpty {
                Text("No active threads")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                VStack(spacing: 0) {
                    ForEach(MockData.activeThreads) { thread in
                        ActiveThreadRow(thread: thread)
                        if thread.id != MockData.activeThreads.last?.id {
                            Divider().opacity(0.3).padding(.leading, 14)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Quick Chip

struct QuickChip: View {
    let icon: String
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 11))
            Text(text)
                .font(.caption2)
                .fontWeight(.medium)
        }
        .foregroundStyle(color)
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(color.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))
        .overlay {
            RoundedRectangle(cornerRadius: 10)
                .strokeBorder(color.opacity(0.2), lineWidth: 0.5)
        }
    }
}

// MARK: - Widget Card

struct WidgetCard<Content: View>: View {
    let title: String
    let icon: String
    let color: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundStyle(color)
                    .frame(width: 24, height: 24)
                    .background(color.opacity(0.12), in: RoundedRectangle(cornerRadius: 6))
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)

            Divider().opacity(0.2).padding(.horizontal, 14)

            content
        }
        .glassCard(cornerRadius: 18, padding: 0)
        .padding(.horizontal)
    }
}

// MARK: - Calendar Widget Content

struct CalendarWidgetContent: View {
    @State private var currentMonth = Date()
    @State private var selectedDate = Date()

    private var monthDays: [Date] {
        let cal = Calendar.current
        let start = cal.date(from: cal.dateComponents([.year, .month], from: currentMonth))!
        let range = cal.range(of: .day, in: .month, for: start)!
        let firstWeekday = (cal.component(.weekday, from: start) + 5) % 7 // Monday = 0
        var days: [Date] = []
        // Leading blanks
        for i in 0..<firstWeekday {
            let prev = cal.date(byAdding: .day, value: -(firstWeekday - i), to: start)!
            days.append(prev)
        }
        // Current month days
        for day in range {
            days.append(cal.date(byAdding: .day, value: day - 1, to: start)!)
        }
        // Trailing to fill grid
        while days.count % 7 != 0 {
            days.append(cal.date(byAdding: .day, value: 1, to: days.last!)!)
        }
        return days
    }

    private var meetingDates: Set<String> {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        return Set(MockData.meetings.map { fmt.string(from: $0.startTime) })
    }

    private var meetingsOnSelected: [Meeting] {
        let cal = Calendar.current
        return MockData.meetings.filter { cal.isDate($0.startTime, inSameDayAs: selectedDate) }
    }

    var body: some View {
        VStack(spacing: 6) {
            // Month nav
            HStack {
                Button { withAnimation { currentMonth = Calendar.current.date(byAdding: .month, value: -1, to: currentMonth)! } } label: {
                    Image(systemName: "chevron.left").font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Text(currentMonth.formatted(.dateTime.month(.wide).year()))
                    .font(.subheadline).fontWeight(.semibold)
                Spacer()
                Button { withAnimation { currentMonth = Calendar.current.date(byAdding: .month, value: 1, to: currentMonth)! } } label: {
                    Image(systemName: "chevron.right").font(.caption).foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal, 4)

            // Weekday headers
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 4) {
                ForEach(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(day == "Sa" || day == "Su" ? Color(hex: "FF3B30").opacity(0.5) : Color.secondary)
                }
            }

            // Days grid
            let fmt = DateFormatter()
            let _ = fmt.dateFormat = "yyyy-MM-dd"
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 2) {
                ForEach(monthDays, id: \.timeIntervalSince1970) { day in
                    let cal = Calendar.current
                    let inMonth = cal.isDate(day, equalTo: currentMonth, toGranularity: .month)
                    let isToday = cal.isDateInToday(day)
                    let isSelected = cal.isDate(day, inSameDayAs: selectedDate)
                    let hasMeeting = meetingDates.contains(fmt.string(from: day))

                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) { selectedDate = day }
                    } label: {
                        VStack(spacing: 1) {
                            Text("\(cal.component(.day, from: day))")
                                .font(.system(size: 13))
                                .fontWeight(isToday ? .bold : .regular)
                                .foregroundColor(
                                    !inMonth ? Color.gray.opacity(0.3) :
                                    isToday && isSelected ? .white :
                                    isToday ? Color(hex: "6C63FF") :
                                    isSelected ? Color(hex: "6C63FF") : .primary
                                )

                            Circle()
                                .fill(hasMeeting && inMonth
                                    ? (isToday && isSelected ? .white : Color(hex: "6C63FF"))
                                    : .clear)
                                .frame(width: 4, height: 4)
                        }
                        .frame(height: 34)
                        .frame(maxWidth: .infinity)
                        .background(
                            isToday && isSelected ? Color(hex: "6C63FF") :
                            isSelected ? Color(hex: "6C63FF").opacity(0.12) :
                            isToday ? Color(hex: "6C63FF").opacity(0.08) : .clear,
                            in: RoundedRectangle(cornerRadius: 8)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }

            // Meetings for selected date
            if !meetingsOnSelected.isEmpty {
                Divider().opacity(0.2).padding(.top, 4)
                VStack(alignment: .leading, spacing: 4) {
                    let dateLabel = Calendar.current.isDateInToday(selectedDate) ? "Today" : selectedDate.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
                    Text("\(dateLabel) — \(meetingsOnSelected.count) event\(meetingsOnSelected.count > 1 ? "s" : "")")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    ForEach(meetingsOnSelected) { m in
                        HStack(spacing: 8) {
                            RoundedRectangle(cornerRadius: 1.5)
                                .fill(m.color.color)
                                .frame(width: 3, height: 24)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(m.title)
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .lineLimit(1)
                                Text("\(m.startTime.formatted(date: .omitted, time: .shortened)) – \(m.endTime.formatted(date: .omitted, time: .shortened))")
                                    .font(.system(size: 10))
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            if m.status == .completed {
                                Text("Done")
                                    .font(.system(size: 9, weight: .medium))
                                    .foregroundStyle(.secondary)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(.ultraThinMaterial, in: Capsule())
                            }
                            if m.status == .inProgress {
                                Text("Live")
                                    .font(.system(size: 9, weight: .semibold))
                                    .foregroundStyle(Color(hex: "34C759"))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color(hex: "34C759").opacity(0.12), in: Capsule())
                            }
                        }
                        .padding(.vertical, 3)
                    }
                }
            }
        }
        .padding(14)
    }
}

// MARK: - Meeting Row

struct MeetingRow: View {
    let meeting: Meeting

    var body: some View {
        HStack(spacing: 10) {
            // Time column
            VStack(spacing: 0) {
                Text(meeting.startTime.formatted(date: .omitted, time: .shortened))
                    .font(.caption)
                    .fontWeight(.semibold)
                if !Calendar.current.isDateInToday(meeting.startTime) {
                    Text(meeting.startTime.formatted(.dateTime.month(.abbreviated).day()))
                        .font(.system(size: 9))
                        .foregroundStyle(.tertiary)
                }
            }
            .frame(width: 52)

            // Color bar
            RoundedRectangle(cornerRadius: 1.5)
                .fill(meeting.color.color)
                .frame(width: 3, height: 40)

            // Content
            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(meeting.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .lineLimit(1)
                    if meeting.status == .inProgress {
                        Text("Live")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(Color(hex: "34C759"))
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color(hex: "34C759").opacity(0.12), in: Capsule())
                    }
                }

                HStack(spacing: 8) {
                    HStack(spacing: 3) {
                        Image(systemName: "clock")
                            .font(.system(size: 9))
                        Text("\(meeting.startTime.formatted(date: .omitted, time: .shortened)) – \(meeting.endTime.formatted(date: .omitted, time: .shortened))")
                    }
                    if meeting.recurring {
                        HStack(spacing: 2) {
                            Image(systemName: "repeat")
                                .font(.system(size: 8))
                            Text("Recurring")
                        }
                    }
                }
                .font(.system(size: 10))
                .foregroundStyle(.secondary)

                if let location = meeting.location {
                    HStack(spacing: 3) {
                        Image(systemName: meeting.isOnline ? "video.fill" : "mappin")
                            .font(.system(size: 9))
                            .foregroundStyle(meeting.isOnline ? Color(hex: "6C63FF") : .secondary)
                        Text(location)
                            .font(.system(size: 10))
                            .foregroundStyle(meeting.isOnline ? Color(hex: "6C63FF") : .secondary)
                    }
                }

                // Attendees
                HStack(spacing: -4) {
                    let attendeeUsers = meeting.attendees.prefix(3).compactMap { id in
                        MockData.users.first { $0.id == id }
                    }
                    ForEach(attendeeUsers) { user in
                        AvatarView(initials: user.avatar, size: 18, showStatus: false)
                            .overlay { Circle().stroke(.ultraThinMaterial, lineWidth: 1.5) }
                    }
                    let extra = max(0, meeting.attendees.count - 3)
                    if extra > 0 {
                        Text("+\(extra)")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.secondary)
                            .frame(width: 18, height: 18)
                            .background(.ultraThinMaterial, in: Circle())
                    }
                    Text("\(meeting.attendees.count) attendees")
                        .font(.system(size: 10))
                        .foregroundStyle(.tertiary)
                        .padding(.leading, 6)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}

// MARK: - Services Grid

struct ServicesGrid: View {
    private let services: [(id: String, label: String, desc: String, icon: String, color: Color)] = [
        ("leave", "Apply for Leave", "Request time off", "door.left.hand.open", Color(hex: "34C759")),
        ("overtime", "Overtime", "Log extra hours", "clock.fill", Color(hex: "FF9F0A")),
        ("expense", "Expense", "Submit claims", "banknote.fill", Color(hex: "6C63FF")),
        ("travel", "Travel Request", "Book business trips", "airplane", Color(hex: "0078D4")),
        ("it-support", "IT Support", "Get tech help", "headphones", Color(hex: "FF3B30")),
        ("meeting-room", "Meeting Room", "Reserve a room", "person.3.fill", Color(hex: "A855F7")),
    ]

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            ForEach(services, id: \.id) { svc in
                VStack(spacing: 6) {
                    Image(systemName: svc.icon)
                        .font(.body)
                        .foregroundStyle(svc.color)
                        .frame(width: 36, height: 36)
                        .background(svc.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                        .shadow(color: svc.color.opacity(0.15), radius: 3)

                    Text(svc.label)
                        .font(.system(size: 11, weight: .medium))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)

                    Text(svc.desc)
                        .font(.system(size: 9))
                        .foregroundStyle(.tertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
    }
}

// MARK: - Approval Row

struct ApprovalRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.seal.fill")
                .font(.caption)
                .foregroundStyle(Color(hex: "FF9F0A"))
                .frame(width: 32, height: 32)
                .background(Color(hex: "FF9F0A").opacity(0.12), in: Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(notification.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)
                HStack(spacing: 4) {
                    if let from = notification.from {
                        Text(from)
                    }
                    Text("·")
                    Text(notification.timestamp.shortTimeString)
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }

            Spacer()

            Text("Action Needed")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(Color(hex: "FF9F0A"))
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(Color(hex: "FF9F0A").opacity(0.12), in: Capsule())

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}

// MARK: - Unread Channel Row

struct UnreadChannelRow: View {
    let channel: UnreadChannel

    var body: some View {
        HStack(spacing: 10) {
            Text("#")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundStyle(Color(hex: "34C759"))
                .frame(width: 32, height: 32)
                .background(Color(hex: "34C759").opacity(0.12), in: Circle())

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(channel.spaceName)
                        .foregroundStyle(.secondary)
                    Text("›")
                        .foregroundStyle(.tertiary)
                    Text(channel.channelName)
                        .fontWeight(.medium)
                }
                .font(.subheadline)
                .lineLimit(1)

                Text("Last message \(channel.lastMessage.formatted(date: .omitted, time: .shortened))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            Text("\(channel.count)")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(.white)
                .frame(minWidth: 18, minHeight: 18)
                .background(Color(hex: "FF3B30"), in: Capsule())
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}

// MARK: - Active Thread Row

struct ActiveThreadRow: View {
    let thread: ActiveThread

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                HStack(spacing: 4) {
                    Text(thread.spaceName)
                        .foregroundStyle(.secondary)
                    Text("›")
                        .foregroundStyle(.tertiary)
                    Text("#\(thread.channelName)")
                        .fontWeight(.medium)
                }
                .font(.caption)
                .lineLimit(1)

                Spacer()

                Text(thread.lastReply.formatted(date: .omitted, time: .shortened))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Text(thread.content)
                .font(.subheadline)
                .foregroundStyle(.primary.opacity(0.8))
                .lineLimit(2)

            HStack(spacing: 4) {
                Image(systemName: "bubble.left.fill")
                    .font(.system(size: 10))
                Text("\(thread.replies) replies")
                    .font(.caption2)
            }
            .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}
