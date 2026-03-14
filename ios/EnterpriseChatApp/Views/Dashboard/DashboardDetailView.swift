import SwiftUI

struct DashboardDetailView: View {
    let dashboard: SpaceDashboard
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        ZStack {
            MeshBackgroundView()

            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(dashboard.widgets) { widget in
                        WidgetView(widget: widget)
                    }
                }
                .padding()
            }
        }
        .navigationTitle(dashboard.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct WidgetView: View {
    let widget: DashboardWidget
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(widget.title).font(.subheadline).fontWeight(.semibold)
                Spacer()
                Image(systemName: "ellipsis").foregroundStyle(.tertiary)
            }

            switch widget.type {
            case .metric: metricContent
            case .list: listContent
            case .progress: progressContent
            case .members: membersContent
            case .links: linksContent
            }
        }
        .padding(16)
        .glassCard()
    }

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

    @ViewBuilder
    private var listContent: some View {
        if let items = widget.data.items {
            VStack(spacing: 8) {
                ForEach(items) { item in
                    HStack {
                        Text(item.label).font(.subheadline)
                        Spacer()
                        StatusTag(label: item.status, color: Color(hex: item.statusColor))
                    }
                    .padding(.vertical, 4)
                    if item.id != items.last?.id { Divider().opacity(0.3) }
                }
            }
        }
    }

    @ViewBuilder
    private var progressContent: some View {
        if let progress = widget.data.progress {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                    Spacer()
                    Text("completed").font(.caption).foregroundStyle(.secondary)
                }

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(.ultraThinMaterial)
                            .frame(height: 10)
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color(hex: widget.data.progressColor ?? "6C63FF").gradient)
                            .frame(width: geometry.size.width * progress, height: 10)
                            .shadow(color: Color(hex: widget.data.progressColor ?? "6C63FF").opacity(0.3), radius: 4, y: 1)
                    }
                }
                .frame(height: 10)
            }
        }
    }

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
                                .font(.caption).fontWeight(.medium).lineLimit(1)
                            Text(member.status.label).font(.caption2).foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var linksContent: some View {
        if let links = widget.data.links {
            VStack(spacing: 6) {
                ForEach(links) { link in
                    HStack(spacing: 10) {
                        Image(systemName: link.icon).font(.subheadline)
                            .foregroundStyle(Color(hex: "6C63FF")).frame(width: 28)
                        Text(link.label).font(.subheadline)
                        Spacer()
                        Image(systemName: "arrow.up.right").font(.caption2).foregroundStyle(.tertiary)
                    }
                    .padding(.vertical, 6)
                }
            }
        }
    }
}
