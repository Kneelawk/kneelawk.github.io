use static_files::NpmBuild;

fn main() -> std::io::Result<()> {
    NpmBuild::new("web")
        .install()?
        .run("build")?
        .target("web/dist")
        .change_detection()
        .to_resource_dir()
        .build()
}
