import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var theme: ThemeManager
    @EnvironmentObject var appState: AppState
    @State private var showStatusPicker = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Profile Header
                    profileHeader

                    // Quick Status
                    statusSection

                    // Settings Sections
                    settingsSection("Preferences", items: [
                        SettingItem(icon: "moon.fill", label: "Dark Mode", color: .indigo, toggle: true),
                        SettingItem(icon: "globe", label: "Language", color: .blue, detail: "English"),
                        SettingItem(icon: "bell.fill", label: "Notifications", color: .red),
                        SettingItem(icon: "hand.raised.fill", label: "Privacy", color: .green),
                    ])

                    settingsSection("Content", items: [
                        SettingItem(icon: "doc.text.fill", label: "My Documents", color: .orange),
                        SettingItem(icon: "doc.fill", label: "My Files", color: .blue),
                        SettingItem(icon: "star.fill", label: "Starred Items", color: .yellow),
                        SettingItem(icon: "clock.fill", label: "Recent Activity", color: .purple),
                    ])

                    settingsSection("Support", items: [
                        SettingItem(icon: "questionmark.circle.fill", label: "Help Center", color: .teal),
                        SettingItem(icon: "exclamationmark.bubble.fill", label: "Report a Problem", color: .orange),
                        SettingItem(icon: "info.circle.fill", label: "About", color: .gray),
                    ])

                    // Version
                    Text("Enterprise Chat v1.0.0")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                        .padding(.bottom, 20)
                }
                .padding(.vertical, 8)
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Profile")
        }
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: 14) {
            AvatarView(
                initials: appState.currentUser.avatar,
                size: 80,
                status: appState.currentUser.status
            )

            VStack(spacing: 4) {
                Text(appState.currentUser.name)
                    .font(.title3)
                    .fontWeight(.bold)

                if let title = appState.currentUser.title {
                    Text(title)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                if let dept = appState.currentUser.department {
                    Text(dept)
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
            }

            // Contact info
            HStack(spacing: 20) {
                if let email = appState.currentUser.email {
                    Label(email.components(separatedBy: "@").first ?? email, systemImage: "envelope.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                if let tz = appState.currentUser.timezone {
                    Label(tz, systemImage: "clock.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal)
    }

    // MARK: - Status Section

    private var statusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Status")
                .sectionHeaderStyle()
                .padding(.horizontal)

            HStack(spacing: 10) {
                ForEach(UserStatus.allCases, id: \.self) { status in
                    Button {
                        withAnimation { appState.currentUser.status = status }
                    } label: {
                        VStack(spacing: 6) {
                            Circle()
                                .fill(status.color)
                                .frame(width: 12, height: 12)

                            Text(status.label)
                                .font(.caption2)
                                .fontWeight(appState.currentUser.status == status ? .semibold : .regular)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            appState.currentUser.status == status
                                ? status.color.opacity(0.1)
                                : Color.clear,
                            in: RoundedRectangle(cornerRadius: 10)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(6)
            .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal)
        }
    }

    // MARK: - Settings Section

    private func settingsSection(_ title: String, items: [SettingItem]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .sectionHeaderStyle()
                .padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(items) { item in
                    settingRow(item)

                    if item.id != items.last?.id {
                        Divider()
                            .padding(.leading, 52)
                    }
                }
            }
            .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
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
                .background(item.color.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))

            Text(item.label)
                .font(.subheadline)
                .foregroundStyle(.primary)

            Spacer()

            if item.toggle {
                Toggle("", isOn: Binding(
                    get: { theme.isDarkMode },
                    set: { theme.isDarkMode = $0 }
                ))
                .labelsHidden()
            } else if let detail = item.detail {
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            } else {
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
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
