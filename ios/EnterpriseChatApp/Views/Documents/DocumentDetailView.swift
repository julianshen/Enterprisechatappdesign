import SwiftUI

struct DocumentDetailView: View {
    let document: Document
    @EnvironmentObject var theme: ThemeManager
    @State private var showInfo = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Document header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(document.icon)
                            .font(.largeTitle)

                        Spacer()

                        HStack(spacing: 8) {
                            SecurityBadge(level: document.securityLevel)

                            Image(systemName: document.accessLevel.icon)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    Text(document.title)
                        .font(.title2)
                        .fontWeight(.bold)

                    HStack(spacing: 12) {
                        HStack(spacing: 4) {
                            AvatarView(initials: MockData.user(by: document.createdBy).avatar, size: 20, showStatus: false)
                            Text(MockData.user(by: document.createdBy).name)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Text("Updated \(document.updatedAt.relativeDateString)")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }

                    // Tags
                    HStack(spacing: 6) {
                        ForEach(document.tags, id: \.self) { tag in
                            Text("#\(tag)")
                                .font(.caption)
                                .foregroundStyle(Color(hex: "5B5FC7"))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color(hex: "5B5FC7").opacity(0.1), in: Capsule())
                        }
                    }
                }
                .padding()

                Divider()
                    .padding(.horizontal)

                // Document blocks
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(document.blocks) { block in
                        DocumentBlockView(block: block)
                    }
                }
                .padding()
            }
        }
        .background(theme.surfaceBackground)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 12) {
                    Button { } label: {
                        Image(systemName: document.isStarred ? "star.fill" : "star")
                            .foregroundStyle(document.isStarred ? .yellow : .secondary)
                    }

                    Button { showInfo.toggle() } label: {
                        Image(systemName: "info.circle")
                    }

                    Menu {
                        Button { } label: {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                        Button { } label: {
                            Label("Export PDF", systemImage: "arrow.down.doc")
                        }
                        Button { } label: {
                            Label("Copy Link", systemImage: "link")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .sheet(isPresented: $showInfo) {
            DocumentInfoSheet(document: document)
        }
    }
}

// MARK: - Document Block View

struct DocumentBlockView: View {
    let block: DocumentBlock
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        switch block.type {
        case .heading1:
            Text(block.content)
                .font(.title2)
                .fontWeight(.bold)
                .padding(.top, 12)

        case .heading2:
            Text(block.content)
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.top, 8)

        case .heading3:
            Text(block.content)
                .font(.headline)
                .padding(.top, 6)

        case .paragraph:
            Text(block.content)
                .font(.body)
                .foregroundStyle(.primary.opacity(0.85))
                .lineSpacing(4)

        case .bullet:
            HStack(alignment: .top, spacing: 8) {
                Text("•")
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)
                Text(block.content)
                    .font(.body)
            }
            .padding(.leading, 8)

        case .numbered:
            HStack(alignment: .top, spacing: 8) {
                Text(block.content.prefix(2).trimmingCharacters(in: .whitespaces))
                    .font(.body)
                    .fontWeight(.medium)
                    .foregroundStyle(.secondary)
                    .frame(width: 24)
                Text(block.content)
                    .font(.body)
            }
            .padding(.leading, 8)

        case .todo:
            HStack(spacing: 10) {
                Image(systemName: block.metadata?.isChecked == true ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(block.metadata?.isChecked == true ? Color(hex: "34C759") : .secondary)
                    .font(.title3)

                Text(block.content)
                    .font(.body)
                    .strikethrough(block.metadata?.isChecked == true)
                    .foregroundStyle(block.metadata?.isChecked == true ? .secondary : .primary)
            }
            .padding(.leading, 4)

        case .callout:
            HStack(alignment: .top, spacing: 10) {
                if let icon = block.metadata?.calloutIcon {
                    Image(systemName: icon)
                        .font(.body)
                        .foregroundStyle(calloutColor)
                } else {
                    Image(systemName: "info.circle.fill")
                        .font(.body)
                        .foregroundStyle(calloutColor)
                }

                Text(block.content)
                    .font(.subheadline)
                    .foregroundStyle(.primary.opacity(0.85))
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(calloutColor.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .strokeBorder(calloutColor.opacity(0.2), lineWidth: 1)
            )

        case .divider:
            Divider()
                .padding(.vertical, 8)

        case .code:
            VStack(alignment: .leading, spacing: 6) {
                if let lang = block.metadata?.language {
                    Text(lang)
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(.ultraThinMaterial, in: Capsule())
                }

                Text(block.content)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.primary)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(theme.subtleBackground, in: RoundedRectangle(cornerRadius: 8))
            }

        case .quote:
            HStack(spacing: 0) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color(hex: "5B5FC7"))
                    .frame(width: 3)

                Text(block.content)
                    .font(.body)
                    .italic()
                    .foregroundStyle(.secondary)
                    .padding(.leading, 12)
            }
            .padding(.leading, 4)

        case .table, .image:
            EmptyView()
        }
    }

    private var calloutColor: Color {
        if let colorHex = block.metadata?.calloutColor {
            return Color(hex: colorHex)
        }
        return Color(hex: "5B5FC7")
    }
}

// MARK: - Document Info Sheet

struct DocumentInfoSheet: View {
    let document: Document
    @EnvironmentObject var theme: ThemeManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Details") {
                    LabeledContent("Created by", value: MockData.user(by: document.createdBy).name)
                    LabeledContent("Created", value: document.createdAt.fullDateString)
                    LabeledContent("Updated", value: document.updatedAt.fullDateString)
                    LabeledContent("Blocks", value: "\(document.blocks.count)")
                }

                Section("Security") {
                    HStack {
                        Text("Security Level")
                        Spacer()
                        SecurityBadge(level: document.securityLevel)
                    }
                    LabeledContent("Access") {
                        Label(document.accessLevel.label, systemImage: document.accessLevel.icon)
                            .font(.subheadline)
                    }
                }

                Section("Tags") {
                    FlowLayout(spacing: 6) {
                        ForEach(document.tags, id: \.self) { tag in
                            Text("#\(tag)")
                                .font(.caption)
                                .foregroundStyle(Color(hex: "5B5FC7"))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color(hex: "5B5FC7").opacity(0.1), in: Capsule())
                        }
                    }
                }
            }
            .navigationTitle("Document Info")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func computeLayout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth && currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            positions.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: currentY + lineHeight), positions)
    }
}
