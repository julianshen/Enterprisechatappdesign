// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EnterpriseChatApp",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "EnterpriseChatApp",
            targets: ["EnterpriseChatApp"]
        ),
    ],
    targets: [
        .target(
            name: "EnterpriseChatApp",
            path: "EnterpriseChatApp",
            exclude: ["Assets.xcassets"],
            resources: []
        ),
    ]
)
