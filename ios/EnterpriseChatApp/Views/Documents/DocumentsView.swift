import SwiftUI

struct DocumentsView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var searchText = ""
    @State private var selectedFilter: DocFilter = .all

    enum DocFilter: String, CaseIterable {
        case all = "All"
        case starred = "Starred"
        case myDocs = "My Docs"
        case shared = "Shared"
    }

    private var filteredDocs: [Document] {
        var docs = MockData.documents
        if !searchText.isEmpty {
            docs = docs.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.tags.contains { $0.localizedCaseInsensitiveContains(searchText) }
            }
        }
        switch selectedFilter {
        case .all: break
        case .starred: docs = docs.filter { $0.isStarred }
        case .myDocs: docs = docs.filter { $0.createdBy == "current" }
        case .shared: docs = docs.filter { $0.accessLevel != .confidential }
        }
        return docs
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Search
                    SearchBarView(text: $searchText, placeholder: "Search documents")
                        .padding(.horizontal)

                    // Filters
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(DocFilter.allCases, id: \.self) { filter in
                                FilterChip(
                                    label: filter.rawValue,
                                    isSelected: selectedFilter == filter
                                ) {
                                    withAnimation { selectedFilter = filter }
                                }
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Recent Documents (horizontal scroll)
                    if selectedFilter == .all && searchText.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Recent")
                                .sectionHeaderStyle()
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(MockData.documents.prefix(3)) { doc in
                                        NavigationLink(destination: DocumentDetailView(document: doc)) {
                                            RecentDocCard(document: doc)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // All Documents
                    VStack(alignment: .leading, spacing: 10) {
                        if selectedFilter == .all && searchText.isEmpty {
                            Text("All Documents")
                                .sectionHeaderStyle()
                                .padding(.horizontal)
                        }

                        LazyVStack(spacing: 8) {
                            ForEach(filteredDocs) { doc in
                                NavigationLink(destination: DocumentDetailView(document: doc)) {
                                    DocumentRow(document: doc)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical, 8)
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Documents")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { } label: {
                        Image(systemName: "plus")
                            .fontWeight(.medium)
                    }
                }
            }
        }
    }
}

// MARK: - Recent Document Card

struct RecentDocCard: View {
    let document: Document
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(document.icon)
                    .font(.title2)

                Spacer()

                SecurityBadge(level: document.securityLevel)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(document.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)
                    .lineLimit(2)

                Text("Updated \(document.updatedAt.relativeDateString)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Tags
            HStack(spacing: 4) {
                ForEach(document.tags.prefix(2), id: \.self) { tag in
                    Text(tag)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.ultraThinMaterial, in: Capsule())
                }
            }
        }
        .frame(width: 180)
        .padding(14)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Document Row

struct DocumentRow: View {
    let document: Document
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            Text(document.icon)
                .font(.title2)
                .frame(width: 40, height: 40)
                .background(theme.subtleBackground, in: RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(document.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)
                        .lineLimit(1)

                    SecurityBadge(level: document.securityLevel)
                }

                HStack(spacing: 8) {
                    Text("by \(MockData.user(by: document.createdBy).name)")
                    Text("·")
                    Text(document.updatedAt.relativeDateString)
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }

            Spacer()

            if document.isStarred {
                Image(systemName: "star.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(12)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
    }
}
