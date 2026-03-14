import SwiftUI

struct SearchBarView: View {
    @Binding var text: String
    var placeholder: String = "Search"
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
                .font(.subheadline)

            TextField(placeholder, text: $text)
                .font(.subheadline)
                .autocorrectionDisabled()

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                        .font(.subheadline)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
        .overlay {
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(theme.glassBorder.opacity(0.5), lineWidth: 0.5)
        }
    }
}

struct FilterChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundStyle(isSelected ? .white : .primary)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background {
                    if isSelected {
                        Capsule()
                            .fill(Color(hex: "6C63FF").gradient)
                            .shadow(color: Color(hex: "6C63FF").opacity(0.3), radius: 6, y: 2)
                    } else {
                        Capsule()
                            .fill(.ultraThinMaterial)
                            .overlay {
                                Capsule()
                                    .strokeBorder(theme.glassBorder.opacity(0.4), lineWidth: 0.5)
                            }
                    }
                }
        }
        .buttonStyle(.plain)
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundStyle(.tertiary)

            VStack(spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(.secondary)

                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(40)
    }
}
