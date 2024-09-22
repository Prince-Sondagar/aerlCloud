use clap::Parser;

/// Command line and environment variable arguments.
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// Log level.
    #[arg(short, long, default_value = "info", env = "HUBD_LOG_LEVEL")]
    pub log_level: log::LevelFilter,

    /// Path to the state file.
    #[arg(long, default_value = "/var/lib/hubd", env = "HUBD_STATE_PATH")]
    pub state_path: String,

    /// Supabase API URL.
    #[arg(long, default_value = "https://sb.aerl.cloud", env = "HUBD_SB_API_URL")]
    pub supabase_api_url: String,

    /// Anonymous JWT token - SB Project ANON Token
    #[arg(
        long,
        default_value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eW51ZnV0aHZnaHFhbmxrbHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ0MjU0NTgsImV4cCI6MjAyMDAwMTQ1OH0.TPdVze-1sRtexZZ-k9WP4uF2s7mn4uKQju0AInca_Ac",
        env = "HUBD_API_ANON_KEY"
    )]
    pub api_anon_key: String,

    /// API URL.
    #[arg(long, default_value = "https://api.aerl.cloud", env = "HUBD_API_URL")]
    pub api_url: String,

    /// Load new firmware to a given serial number. Args: <serial number> <path to binary>
    #[arg(long, num_args(2))]
    pub load_firmware_serial: Option<Vec<String>>,

    /// Load new firmware to a range of serial numbers. Args <first_serial:last_serial> <path to binary>
    #[arg(long, num_args(2))]
    pub load_firmware_serial_range: Option<Vec<String>>,

    /// Reboot connected Gateways
    #[arg(long, action = clap::ArgAction::SetTrue)]
    pub reset: bool,
}
