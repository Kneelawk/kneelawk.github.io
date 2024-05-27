use std::fs::File;
use std::io::Read;
use std::io::Write;
use std::path::{Path, PathBuf};

use anyhow::Context;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Config {
    pub bind_addr: String,
    pub static_dir: PathBuf,
    pub index_file_name: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            bind_addr: "0.0.0.0:8080".to_string(),
            static_dir: PathBuf::from("site"),
            index_file_name: "index.html".to_string(),
        }
    }
}

pub fn load_config() -> anyhow::Result<Config> {
    let config_path = Path::new("kneelawk-com.toml");

    info!("Loading config file {}", config_path.to_string_lossy());

    if !config_path.exists() {
        info!("Config does not exist, creating a new one...");

        let config = Config::default();
        let mut file = File::options()
            .create(true)
            .write(true)
            .open(config_path)
            .context("Opening empty config file")?;

        let str = toml::to_string_pretty(&config).context("Serializing default config")?;
        write!(&mut file, "{}", str).context("Writing default config")?;

        return Ok(config);
    }

    let mut file = File::open(config_path).context("Opening file")?;
    let mut str = String::new();
    file.read_to_string(&mut str).context("Reading file")?;

    let res: Result<Config, _> = toml::from_str(&str).context("Parsing file");
    let config = match res {
        Ok(config) => config,
        Err(e) => {
            warn!("Found invalid config. Resetting...\n{:?}", e);
            let config = Config::default();

            let mut file = File::options()
                .create(true)
                .write(true)
                .open(config_path)
                .context("Opening invalid config file for resetting")?;

            let str = toml::to_string_pretty(&config).context("Serializing default config")?;
            write!(&mut file, "{}", str).context("Writing default config")?;

            config
        }
    };

    info!("Config loaded.");

    Ok(config)
}
