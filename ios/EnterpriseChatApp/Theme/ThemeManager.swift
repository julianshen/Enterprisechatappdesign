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

    var accentColor: Color { Color(hex: "6C63FF") }
    var secondaryAccent: Color { Color(hex: "00D2FF") }
    var successColor: Color { Color(hex: "34C759") }
    var warningColor: Color { Color(hex: "FF9F0A") }
    var dangerColor: Color { Color(hex: "FF453A") }

    var glassBorder: Color {
        isDarkMode ? .white.opacity(0.15) : .white.opacity(0.7)
    }

    var glassHighlight: Color {
        isDarkMode ? .white.opacity(0.06) : .white.opacity(0.45)
    }

    var subtleBackground: Color {
        isDarkMode ? Color.white.opacity(0.06) : Color.black.opacity(0.03)
    }

    var secondaryText: Color {
        isDarkMode ? Color.white.opacity(0.6) : Color.black.opacity(0.5)
    }

    var tertiaryText: Color {
        isDarkMode ? Color.white.opacity(0.4) : Color.black.opacity(0.35)
    }
}

// MARK: - Animated Mesh Background

struct MeshBackgroundView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var phase: CGFloat = 0

    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Base
                (theme.isDarkMode ? Color(hex: "0A0A1A") : Color(hex: "F0F2FF"))
                    .ignoresSafeArea()

                // Blob 1 - Purple
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "6C63FF").opacity(theme.isDarkMode ? 0.35 : 0.2), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.5
                        )
                    )
                    .frame(width: geo.size.width * 0.9)
                    .offset(x: -geo.size.width * 0.2, y: -geo.size.height * 0.15 + sin(phase) * 20)
                    .blur(radius: 60)

                // Blob 2 - Cyan
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "00D2FF").opacity(theme.isDarkMode ? 0.25 : 0.15), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.45
                        )
                    )
                    .frame(width: geo.size.width * 0.8)
                    .offset(x: geo.size.width * 0.3, y: geo.size.height * 0.2 + cos(phase * 0.8) * 15)
                    .blur(radius: 50)

                // Blob 3 - Pink
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "FF6B9D").opacity(theme.isDarkMode ? 0.2 : 0.1), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.4
                        )
                    )
                    .frame(width: geo.size.width * 0.7)
                    .offset(x: geo.size.width * 0.1, y: geo.size.height * 0.55 + sin(phase * 1.2) * 18)
                    .blur(radius: 55)

                // Blob 4 - Teal (subtle)
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "00BFA6").opacity(theme.isDarkMode ? 0.15 : 0.08), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.35
                        )
                    )
                    .frame(width: geo.size.width * 0.6)
                    .offset(x: -geo.size.width * 0.25, y: geo.size.height * 0.4 + cos(phase * 0.6) * 12)
                    .blur(radius: 45)
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 8).repeatForever(autoreverses: true)) {
                    phase = .pi * 2
                }
            }
        }
        .ignoresSafeArea()
    }
}

// MARK: - Glass Card Modifier

struct GlassCard: ViewModifier {
    @EnvironmentObject var theme: ThemeManager
    var cornerRadius: CGFloat = 20
    var padding: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .strokeBorder(
                                LinearGradient(
                                    colors: [
                                        theme.glassBorder,
                                        theme.glassBorder.opacity(0.3),
                                        theme.glassBorder.opacity(0.1),
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 0.5
                            )
                    }
                    .shadow(color: .black.opacity(theme.isDarkMode ? 0.3 : 0.06), radius: 12, y: 4)
            }
    }
}

struct GlassCardTinted: ViewModifier {
    let tintColor: Color
    @EnvironmentObject var theme: ThemeManager
    var cornerRadius: CGFloat = 20

    func body(content: Content) -> some View {
        content
            .background {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(tintColor.opacity(theme.isDarkMode ? 0.12 : 0.06))
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .strokeBorder(
                                LinearGradient(
                                    colors: [
                                        tintColor.opacity(0.4),
                                        theme.glassBorder.opacity(0.2),
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 0.5
                            )
                    }
                    .shadow(color: tintColor.opacity(0.1), radius: 12, y: 4)
            }
    }
}

// MARK: - Section Header

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

// MARK: - Extensions

extension View {
    func glassCard(cornerRadius: CGFloat = 20, padding: CGFloat = 0) -> some View {
        modifier(GlassCard(cornerRadius: cornerRadius, padding: padding))
    }

    func glassCardTinted(_ color: Color, cornerRadius: CGFloat = 20) -> some View {
        modifier(GlassCardTinted(tintColor: color, cornerRadius: cornerRadius))
    }

    func sectionHeaderStyle() -> some View {
        modifier(SectionHeaderStyle())
    }
}
