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
                .overlay {
                    Circle()
                        .strokeBorder(
                            LinearGradient(
                                colors: [.white.opacity(0.5), .white.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
                .shadow(color: backgroundColor.opacity(0.35), radius: size * 0.15, y: 2)

            if showStatus, let status = status {
                Circle()
                    .fill(status.color)
                    .frame(width: size * 0.3, height: size * 0.3)
                    .overlay {
                        Circle()
                            .strokeBorder(.background, lineWidth: 2)
                    }
                    .shadow(color: status.color.opacity(0.5), radius: 3, y: 0)
                    .offset(x: 1, y: 1)
            }
        }
    }

    private func colorFromInitials(_ text: String) -> Color {
        let colors: [Color] = [
            Color(hex: "6C63FF"), Color(hex: "00D2FF"), Color(hex: "FF6B9D"),
            Color(hex: "FF9F0A"), Color(hex: "00BFA6"), Color(hex: "A855F7"),
            Color(hex: "64748B"), Color(hex: "F43F5E"),
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
        RoundedRectangle(cornerRadius: size * 0.28)
            .fill(Color(hex: color).gradient)
            .frame(width: size, height: size)
            .overlay {
                Text(icon)
                    .font(.system(size: size * 0.42, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }
            .overlay {
                RoundedRectangle(cornerRadius: size * 0.28)
                    .strokeBorder(
                        LinearGradient(
                            colors: [.white.opacity(0.5), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 0.8
                    )
            }
            .shadow(color: Color(hex: color).opacity(0.35), radius: size * 0.2, y: 3)
    }
}
