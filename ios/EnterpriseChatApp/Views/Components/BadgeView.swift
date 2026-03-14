import SwiftUI

struct UnreadBadge: View {
    let count: Int

    var body: some View {
        if count > 0 {
            Text(count > 99 ? "99+" : "\(count)")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .padding(.horizontal, count > 9 ? 6 : 4)
                .padding(.vertical, 2)
                .background(
                    Capsule()
                        .fill(Color(hex: "FF453A").gradient)
                        .shadow(color: Color(hex: "FF453A").opacity(0.4), radius: 4, y: 1)
                )
                .fixedSize()
        }
    }
}

struct SecurityBadge: View {
    let level: SecurityLevel

    var body: some View {
        Text(level.rawValue)
            .font(.caption2)
            .fontWeight(.bold)
            .foregroundStyle(level.color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay {
                Capsule()
                    .strokeBorder(level.color.opacity(0.3), lineWidth: 0.5)
            }
    }
}

struct StatusTag: View {
    let label: String
    let color: Color

    var body: some View {
        Text(label)
            .font(.caption2)
            .fontWeight(.medium)
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay {
                Capsule()
                    .strokeBorder(color.opacity(0.25), lineWidth: 0.5)
            }
    }
}

struct TrendIndicator: View {
    let trend: String
    let isPositive: Bool

    var body: some View {
        HStack(spacing: 2) {
            Image(systemName: isPositive ? "arrow.up.right" : "arrow.down.right")
                .font(.caption2)
            Text(trend)
                .font(.caption)
                .fontWeight(.medium)
        }
        .foregroundStyle(isPositive ? Color(hex: "34C759") : Color(hex: "FF453A"))
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
        .background(.ultraThinMaterial, in: Capsule())
    }
}
