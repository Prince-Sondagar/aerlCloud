terraform {
  required_providers {
    jetstream = {
      source  = "nats-io/jetstream"
      version = "0.0.35"
    }
  }
}

// Telem Frame Ingest Stream
resource "jetstream_stream" "telemetry_ingest" {
  name     = "telemetry_ingest"
  subjects = ["ingest.canbus.*", "ingest.modbus.*"]
  storage  = "file"
  max_age  = 60 * 60 * 24 * 60 // 60 days
  replicas = 1
  retention = "workqueue"
}

// Canbus consumer
resource "jetstream_consumer" "cnsmr_canbus" {
    stream_id = jetstream_stream.telemetry_ingest.id
    durable_name = "cnsmr_canbus"
    deliver_all = true
    max_delivery = 5
    replicas = 1
    filter_subject = "ingest.canbus.*"
}

// modbus consumer
resource "jetstream_consumer" "cnsmr_modbus" {
    stream_id = jetstream_stream.telemetry_ingest.id
    durable_name = "cnsmr_modbus"
    deliver_all = true
    max_delivery = 5
    replicas = 1
    filter_subject = "ingest.modbus.*"
}
