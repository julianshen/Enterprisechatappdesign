import SwiftUI

struct DashboardDetailView: View {
    let dashboard: SpaceDashboard
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                ForEach(dashboard.widgets) { widget in
                    WidgetView(widget: widget)
                }
            }
            .padding()
        }
        .background(theme.surfaceBackground)
        .navigationTitle(dashboard.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Widget View

struct WidgetView: View {
    let widget: DashboardWidget
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Widget Header
            HStack {
                Text(widget.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                Image(systemName: "ellipsis")
                    .foregroundStyle(.tertiary)
            }

            // Widget Content
            switch widget.type {
            case .metric:
                metricContent

            case .list:
                listContent

            case .progress:
                progressContent

            case .members:
                membersContent

            case .links:
                linksContent
            }
        }
        .padding(16)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Metric Widget

    @ViewBuilder
    private var metricContent: some View {
        HStack(alignment: .lastTextBaseline, spacing: 8) {
            Text(widget.data.value ?? "—")
                .font(.system(size: 36, weight: .bold, design: .rounded))

            if let trend = widget.data.trend, let isUp = widget.data.trendUp {
                TrendIndicator(trend: trend, isPositive: isUp)
            }
        }
    }

    // MARK: - List Widget

    @ViewBuilder
    private var listContent: some View {
        if let items = widget.data.items {
            VStack(spacing: 8) {
                ForEach(items) { item in
                    HStack {
                        Text(item.label)
                            .font(.subheadline)
                            .foregroundStyle(.primary)

                        Spacer()

                        StatusTag(label: item.status, color: Color(hex: item.statusColor))
                    }
                    .padding(.vertical, 4)

                    if item.id != items.last?.id {
                        Divider()
                    }
                }
            }
        }
    }

    // MARK: - Progress Widget

    @ViewBuilder
    private var progressContent: some View {
        if let progress = widget.data.progress {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 28, weight: .bold, design: .rounded))

                    Spacer()

                    Text("completed")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(theme.subtleBackground)
                            .frame(height: 10)

                        RoundedRectangle(cornerRadius: 6)
                            .fill(
                                Color(hex: widget.data.progressColor ?? "5B5FC7").gradient
                            )
                            .frame(width: geometry.size.width * progress, height: 10)
                    }
                }
                .frame(height: 10)
            }
        }
    }

    // MARK: - Members Widget

    @ViewBuilder
    private var membersContent: some View {
        if let memberIds = widget.data.members {
            let members = memberIds.compactMap { id in MockData.users.first { $0.id == id } }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(members) { member in
                    HStack(spacing: 8) {
                        AvatarView(initials: member.avatar, size: 32, status: member.status)

                        VStack(alignment: .leading, spacing: 1) {
                            Text(member.name.components(separatedBy: " ").first ?? "")
                                .font(.caption)
                                .fontWeight(.medium)
                                .lineLimit(1)

                            Text(member.status.label)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()
                    }
                }
            }
        }
    }

    // MARK: - Links Widget

    @ViewBuilder
    private var linksContent: some View {
        if let links = widget.data.links {
            VStack(spacing: 6) {
                ForEach(links) { link in
                    HStack(spacing: 10) {
                        Image(systemName: link.icon)
                            .font(.subheadline)
                            .foregroundStyle(Color(hex: "5B5FC7"))
                            .frame(width: 28)

                        Text(link.label)
                            .font(.subheadline)
                            .foregroundStyle(.primary)

                        Spacer()

                        Image(systemName: "arrow.up.right")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                    .padding(.vertical, 6)
                }
            }
        }
    }
}
