import SwiftUI

struct AvatarView: View {
    let initials: String
    let size: CGFloat
    var color: Color?
    var status: UserStatus?
    var showStatus: Bool = true

    private var backgroundColor: Color {
        color ?? colorFromInitials(initials)
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Circle()
                .fill(backgroundColor.gradient)
                .frame(width: size, height: size)
                .overlay {
                    Text(initials)
                        .font(.system(size: size * 0.38, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white)
                }

            if showStatus, let status = status {
                Circle()
                    .fill(status.color)
                    .frame(width: size * 0.3, height: size * 0.3)
                    .overlay {
                        Circle()
                            .stroke(.background, lineWidth: 2)
                    }
                    .offset(x: 1, y: 1)
            }
        }
    }

    private func colorFromInitials(_ text: String) -> Color {
        let colors: [Color] = [
            Color(hex: "5B5FC7"), Color(hex: "2196F3"), Color(hex: "E91E63"),
            Color(hex: "FF9800"), Color(hex: "009688"), Color(hex: "9C27B0"),
            Color(hex: "607D8B"), Color(hex: "795548"),
        ]
        let hash = text.unicodeScalars.reduce(0) { $0 + Int($1.value) }
        return colors[hash % colors.count]
    }
}

struct GroupAvatarView: View {
    let members: [User]
    let size: CGFloat

    var body: some View {
        ZStack {
            let displayMembers = Array(members.prefix(2))
            ForEach(Array(displayMembers.enumerated()), id: \.offset) { index, member in
                AvatarView(initials: member.avatar, size: size * 0.65, showStatus: false)
                    .offset(
                        x: index == 0 ? -size * 0.15 : size * 0.15,
                        y: index == 0 ? -size * 0.1 : size * 0.1
                    )
            }
        }
        .frame(width: size, height: size)
    }
}

struct SpaceIconView: View {
    let icon: String
    let color: String
    let size: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.25)
            .fill(Color(hex: color).gradient)
            .frame(width: size, height: size)
            .overlay {
                Text(icon)
                    .font(.system(size: size * 0.42, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }
    }
}
