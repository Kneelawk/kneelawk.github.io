use actix_web::web::Redirect;
use actix_web::{get, web, App, HttpServer, Responder};
use anyhow::Context;

mod frontend {
    include!(concat!(env!("OUT_DIR"), "/generated.rs"));
}

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

    HttpServer::new(move || {
        let generated = frontend::generate();
        App::new()
            .service(maven_root_redirect)
            .service(maven_redirect)
            .service(actix_web_static_files::ResourceFiles::new("/", generated))
    })
    .bind("0.0.0.0:8080")
    .context("Binding port")?
    .run()
    .await
    .context("Starting primary server")?;

    Ok(())
}
