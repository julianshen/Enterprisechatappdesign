import SwiftUI

class ThemeManager: ObservableObject {
    @Published var isDarkMode: Bool {
        didSet {
            UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
        }
    }

    init() {
        self.isDarkMode = UserDefaults.standard.bool(forKey: "isDarkMode")
    }

    var colorScheme: ColorScheme? {
        isDarkMode ? .dark : .light
    }

    var accentColor: Color { Color(hex: "5B5FC7") }
    var secondaryAccent: Color { Color(hex: "2196F3") }
    var successColor: Color { Color(hex: "34C759") }
    var warningColor: Color { Color(hex: "FF9500") }
    var dangerColor: Color { Color(hex: "FF3B30") }

    // Surface colors
    var cardBackground: Color {
        isDarkMode ? Color(hex: "2B2D31") : .white
    }

    var surfaceBackground: Color {
        isDarkMode ? Color(hex: "1E1F22") : Color(hex: "F5F5F5")
    }

    var elevatedBackground: Color {
        isDarkMode ? Color(hex: "313338") : .white
    }

    var subtleBackground: Color {
        isDarkMode ? Color(hex: "383A40") : Color(hex: "F0F0F0")
    }

    var borderColor: Color {
        isDarkMode ? Color.white.opacity(0.08) : Color.black.opacity(0.06)
    }

    var secondaryText: Color {
        isDarkMode ? Color.white.opacity(0.6) : Color.black.opacity(0.5)
    }

    var tertiaryText: Color {
        isDarkMode ? Color.white.opacity(0.4) : Color.black.opacity(0.35)
    }
}

// MARK: - View Modifiers

struct CardStyle: ViewModifier {
    @EnvironmentObject var theme: ThemeManager

    func body(content: Content) -> some View {
        content
            .background(theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(theme.isDarkMode ? 0 : 0.04), radius: 8, y: 2)
    }
}

struct SectionHeaderStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
            .tracking(0.5)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }

    func sectionHeaderStyle() -> some View {
        modifier(SectionHeaderStyle())
    }
}
