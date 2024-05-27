#[macro_use]
extern crate tracing;

use actix_web::web::Redirect;
use actix_web::{get, web, App, HttpServer, Responder};
use anyhow::Context;
use std::fs::create_dir_all;

mod config;

#[get("/maven")]
async fn maven_root_redirect() -> impl Responder {
    Redirect::to("https://maven.kneelawk.com/")
}

#[get("/maven/{sub_path:.*}")]
async fn maven_redirect(path: web::Path<String>) -> impl Responder {
    let sub_path = path.into_inner();
    if sub_path.is_empty() {
        Redirect::to("https://maven.kneelawk.com/")
    } else {
        Redirect::to(format!("https://maven.kneelawk.com/releases/{sub_path}"))
    }
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt().init();

    info!("kneelawk-com initializing");

    let config = config::load_config().context("Loading config")?;
    let bind_addr = config.bind_addr.clone();

    if !config.static_dir.exists() {
        create_dir_all(&config.static_dir).context("Creating site dir")?;
    }

    info!("Starting server on {}", &bind_addr);
    info!("Hosting files from {:?}", &config.static_dir);

    HttpServer::new(move || {
        App::new()
            .service(maven_root_redirect)
            .service(maven_redirect)
            .service(
                actix_files::Files::new("/", &config.static_dir)
                    .index_file("index.html")
                    .redirect_to_slash_directory(),
            )
    })
    .bind(bind_addr)
    .context("Binding port")?
    .run()
    .await
    .context("Starting primary server")?;

    Ok(())
}
