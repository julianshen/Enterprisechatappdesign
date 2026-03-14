import SwiftUI

struct InboxView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var selectedTab: InboxTab = .notifications

    enum InboxTab: String, CaseIterable {
        case notifications = "Notifications"
        case mentions = "Mentions"
    }

    private var notifications: [Activity] {
        if selectedTab == .mentions {
            return MockData.activities.filter { $0.type == .mention }
        }
        return MockData.activities
    }

    var body: some View {
        VStack(spacing: 0) {
            Picker("", selection: $selectedTab) {
                ForEach(InboxTab.allCases, id: \.self) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)
            .padding()

            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(notifications) { activity in
                        ActivityRow(activity: activity)

                        if activity.id != notifications.last?.id {
                            Divider()
                                .padding(.leading, 52)
                        }
                    }
                }
                .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
                .padding(.horizontal)
            }
        }
        .background(theme.surfaceBackground)
        .navigationTitle("Inbox")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { } label: {
                    Text("Mark All Read")
                        .font(.caption)
                }
            }
        }
    }
}
