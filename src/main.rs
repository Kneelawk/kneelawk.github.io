use actix_web::{App, HttpServer};

include!(concat!(env!("OUT_DIR"), "/generated.rs"));

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(move || {
        let generated = generate();
        App::new().service(actix_web_static_files::ResourceFiles::new("/", generated))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
