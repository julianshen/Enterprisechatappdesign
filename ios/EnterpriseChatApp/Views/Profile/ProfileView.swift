import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var theme: ThemeManager
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ZStack {
                MeshBackgroundView()

                ScrollView {
                    VStack(spacing: 20) {
                        profileHeader
                        statusSection

                        settingsSection("Preferences", items: [
                            SettingItem(icon: "moon.fill", label: "Dark Mode", color: .indigo, toggle: true),
                            SettingItem(icon: "globe", label: "Language", color: Color(hex: "00D2FF"), detail: "English"),
                            SettingItem(icon: "bell.fill", label: "Notifications", color: Color(hex: "FF453A")),
                            SettingItem(icon: "hand.raised.fill", label: "Privacy", color: Color(hex: "00BFA6")),
                        ])

                        settingsSection("Content", items: [
                            SettingItem(icon: "doc.text.fill", label: "My Documents", color: Color(hex: "FF9F0A")),
                            SettingItem(icon: "doc.fill", label: "My Files", color: Color(hex: "00D2FF")),
                            SettingItem(icon: "star.fill", label: "Starred Items", color: .yellow),
                            SettingItem(icon: "clock.fill", label: "Recent Activity", color: Color(hex: "A855F7")),
                        ])

                        settingsSection("Support", items: [
                            SettingItem(icon: "questionmark.circle.fill", label: "Help Center", color: .teal),
                            SettingItem(icon: "exclamationmark.bubble.fill", label: "Report a Problem", color: Color(hex: "FF9F0A")),
                            SettingItem(icon: "info.circle.fill", label: "About", color: .gray),
                        ])

                        Text("Enterprise Chat v1.0.0")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                            .padding(.bottom, 20)
                    }
                    .padding(.vertical, 8)
                }
            }
            .navigationTitle("Profile")
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 14) {
            AvatarView(initials: appState.currentUser.avatar, size: 80, status: appState.currentUser.status)

            VStack(spacing: 4) {
                Text(appState.currentUser.name).font(.title3).fontWeight(.bold)
                if let title = appState.currentUser.title {
                    Text(title).font(.subheadline).foregroundStyle(.secondary)
                }
                if let dept = appState.currentUser.department {
                    Text(dept).font(.caption).foregroundStyle(.tertiary)
                }
            }

            HStack(spacing: 20) {
                if let email = appState.currentUser.email {
                    Label(email.components(separatedBy: "@").first ?? email, systemImage: "envelope.fill")
                        .font(.caption).foregroundStyle(.secondary)
                }
                if let tz = appState.currentUser.timezone {
                    Label(tz, systemImage: "clock.fill")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity)
        .glassCard()
        .padding(.horizontal)
    }

    private var statusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Status").sectionHeaderStyle().padding(.horizontal)

            HStack(spacing: 10) {
                ForEach(UserStatus.allCases, id: \.self) { status in
                    Button {
                        withAnimation(.spring(response: 0.3)) { appState.currentUser.status = status }
                    } label: {
                        VStack(spacing: 6) {
                            Circle()
                                .fill(status.color)
                                .frame(width: 12, height: 12)
                                .shadow(color: appState.currentUser.status == status ? status.color.opacity(0.6) : .clear, radius: 4)

                            Text(status.label)
                                .font(.caption2)
                                .fontWeight(appState.currentUser.status == status ? .semibold : .regular)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background {
                            if appState.currentUser.status == status {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(.ultraThinMaterial)
                                    .overlay {
                                        RoundedRectangle(cornerRadius: 10)
                                            .strokeBorder(status.color.opacity(0.3), lineWidth: 0.5)
                                    }
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(6)
            .glassCard(cornerRadius: 16)
            .padding(.horizontal)
        }
    }

    private func settingsSection(_ title: String, items: [SettingItem]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).sectionHeaderStyle().padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(items) { item in
                    settingRow(item)
                    if item.id != items.last?.id {
                        Divider().opacity(0.3).padding(.leading, 52)
                    }
                }
            }
            .glassCard(cornerRadius: 18, padding: 0)
            .padding(.horizontal)
        }
    }

    @ViewBuilder
    private func settingRow(_ item: SettingItem) -> some View {
        HStack(spacing: 12) {
            Image(systemName: item.icon)
                .font(.subheadline)
                .foregroundStyle(item.color)
                .frame(width: 32, height: 32)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
                .overlay {
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(item.color.opacity(0.2), lineWidth: 0.5)
                }
                .shadow(color: item.color.opacity(0.2), radius: 3)

            Text(item.label).font(.subheadline)

            Spacer()

            if item.toggle {
                Toggle("", isOn: Binding(
                    get: { theme.isDarkMode },
                    set: { theme.isDarkMode = $0 }
                )).labelsHidden()
            } else if let detail = item.detail {
                Text(detail).font(.caption).foregroundStyle(.secondary)
                Image(systemName: "chevron.right").font(.caption2).foregroundStyle(.tertiary)
            } else {
                Image(systemName: "chevron.right").font(.caption2).foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}

struct SettingItem: Identifiable {
    let id = UUID()
    let icon: String
    let label: String
    let color: Color
    var detail: String?
    var toggle: Bool = false
}
