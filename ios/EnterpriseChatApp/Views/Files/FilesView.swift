import SwiftUI

struct FilesView: View {
    @EnvironmentObject var theme: ThemeManager
    @State private var searchText = ""
    @State private var selectedFilter: FileFilter = .all
    @State private var viewMode: ViewMode = .list

    enum FileFilter: String, CaseIterable {
        case all = "All"
        case documents = "Docs"
        case images = "Images"
        case folders = "Folders"
        case starred = "Starred"
    }

    enum ViewMode {
        case list, grid
    }

    private var filteredFiles: [FileItem] {
        var files = MockData.files
        if !searchText.isEmpty {
            files = files.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        switch selectedFilter {
        case .all: break
        case .documents: files = files.filter { [.pdf, .doc, .xls, .ppt].contains($0.type) }
        case .images: files = files.filter { $0.type == .image }
        case .folders: files = files.filter { $0.type == .folder }
        case .starred: files = files.filter { $0.isStarred }
        }
        return files
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search & Filters
                VStack(spacing: 12) {
                    SearchBarView(text: $searchText, placeholder: "Search files")

                    HStack {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(FileFilter.allCases, id: \.self) { filter in
                                    FilterChip(
                                        label: filter.rawValue,
                                        isSelected: selectedFilter == filter
                                    ) {
                                        withAnimation { selectedFilter = filter }
                                    }
                                }
                            }
                        }

                        Spacer()

                        Button {
                            withAnimation { viewMode = viewMode == .list ? .grid : .list }
                        } label: {
                            Image(systemName: viewMode == .list ? "square.grid.2x2" : "list.bullet")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 8)

                // Quick Stats
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        FileStatCard(icon: "doc.fill", label: "Documents", count: "24", color: .blue)
                        FileStatCard(icon: "photo.fill", label: "Images", count: "12", color: .purple)
                        FileStatCard(icon: "film.fill", label: "Videos", count: "3", color: .pink)
                        FileStatCard(icon: "archivebox.fill", label: "Archives", count: "5", color: .gray)
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 12)

                // File List
                ScrollView {
                    if viewMode == .list {
                        LazyVStack(spacing: 0) {
                            ForEach(filteredFiles) { file in
                                FileRow(file: file)
                                if file.id != filteredFiles.last?.id {
                                    Divider()
                                        .padding(.leading, 64)
                                }
                            }
                        }
                    } else {
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            ForEach(filteredFiles) { file in
                                FileGridItem(file: file)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .background(theme.surfaceBackground)
            .navigationTitle("Files")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button { } label: {
                            Label("Upload File", systemImage: "arrow.up.doc")
                        }
                        Button { } label: {
                            Label("New Folder", systemImage: "folder.badge.plus")
                        }
                        Button { } label: {
                            Label("Take Photo", systemImage: "camera")
                        }
                    } label: {
                        Image(systemName: "plus")
                            .fontWeight(.medium)
                    }
                }
            }
        }
    }
}

// MARK: - File Stat Card

struct FileStatCard: View {
    let icon: String
    let label: String
    let count: String
    let color: Color
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)

            Text(count)
                .font(.headline)
                .fontWeight(.bold)

            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(width: 80, height: 80)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - File Row

struct FileRow: View {
    let file: FileItem
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: file.type.icon)
                .font(.title3)
                .foregroundStyle(file.type.color)
                .frame(width: 40, height: 40)
                .background(file.type.color.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(file.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .lineLimit(1)

                    SecurityBadge(level: file.securityLevel)
                }

                HStack(spacing: 8) {
                    Text(file.size)
                    Text("·")
                    Text(file.uploadedAt.relativeDateString)
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }

            Spacer()

            if file.isStarred {
                Image(systemName: "star.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
            }

            Image(systemName: "ellipsis")
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - File Grid Item

struct FileGridItem: View {
    let file: FileItem
    @EnvironmentObject var theme: ThemeManager

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: file.type.icon)
                .font(.largeTitle)
                .foregroundStyle(file.type.color)
                .frame(height: 56)

            VStack(spacing: 2) {
                Text(file.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)

                Text(file.size)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(14)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 14))
        .overlay(alignment: .topTrailing) {
            if file.isStarred {
                Image(systemName: "star.fill")
                    .font(.caption2)
                    .foregroundStyle(.yellow)
                    .padding(8)
            }
        }
    }
}
