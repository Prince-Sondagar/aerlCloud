use crate::auth::ACCESS_TOKEN;
use crate::ARGS;
use anyhow::Result;
use postgrest::Postgrest;

use super::interface::Interface;
use super::product::Product;

// Supabase table types
#[derive(Debug, Deserialize, Clone)]
pub struct Device {
    pub id: i64,
    pub modbus_interface: InterfaceRow,
    pub modbus_product: ProductRow,
}

#[derive(Debug, Deserialize, Clone)]
pub struct InterfaceRow {
    pub config: Interface,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ProductRow {
    pub id: i64,
    pub name: String,
    pub manufacturer: String,
    pub schema: Product,
}

pub struct DB {
    client: Postgrest,
}

impl DB {
    /// Constructs a new `SupabaseClient`.
    pub async fn new() -> Result<Self> {
        let client = Postgrest::new(ARGS.supabase_api_url.to_string() + "/rest/v1")
            .insert_header(
                "Authorization",
                format!("Bearer {}", &ACCESS_TOKEN.read().await),
            )
            .insert_header("apikey", &ARGS.api_anon_key);

        Ok(DB { client })
    }

    pub async fn devices(&self) -> Result<Vec<Device>> {
        let resp = self
            .client
            .from("modbus_device")
            .select(
                "id, modbus_product (id, name, manufacturer, schema), modbus_interface ( config )",
            )
            .execute()
            .await?;

        let body = resp.text().await?;

        let products: Vec<Device> = serde_json::from_str(&body)?;

        Ok(products)
    }
}
