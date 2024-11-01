# Enable necessary Google Cloud APIs
module "project_services" {
  source                      = "terraform-google-modules/project-factory/google//modules/project_services"
  version                     = "~> 17.0"
  disable_services_on_destroy = false

  project_id = var.project_id

  activate_apis = [
    "aiplatform.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "storage.googleapis.com",
  ]
}

# We need a Google Storage bucket to store a JSONL file containing vector representations (embeddings) of Cymbal Direct products
resource "google_storage_bucket" "cymbal_direct_bucket" {
  project                     = var.project_id
  name                        = "cymbal-direct-bucket"
  location                    = "us-central1"
  force_destroy               = true
  uniform_bucket_level_access = true
}

# Upload the JSONL file containing vector representations (embeddings) of Cymbal Direct products
resource "google_storage_bucket_object" "product_embeddings_file" {
  bucket = google_storage_bucket.cymbal_direct_bucket.name
  name   = "cymbal-direct-product-embeddings.json" # As of Nov 1, Vector Search doesn't support ".jsonl"
  source = "${path.module}/../product-embeddings/product-embeddings.jsonl"
}

# The Vector Search index is a data structure that's optimized for quickly finding the most similar vectors to a given query vector
resource "google_vertex_ai_index" "vector_search_index" {
  project             = module.project_services.project_id
  region              = "us-central1"
  display_name        = "cymbal-direct-index"
  index_update_method = "STREAM_UPDATE"
  metadata {
    contents_delta_uri = "gs://${google_storage_bucket.cymbal_direct_bucket.name}"
    config {
      dimensions                  = 768 # This is the length of each vector — depends on the model used for embeddings
      approximate_neighbors_count = 2 # We've kept this low because the sample app doesn't contain many products
      shard_size                  = "SHARD_SIZE_SMALL"
      distance_measure_type       = "SQUARED_L2_DISTANCE"
      algorithm_config {
        tree_ah_config {
          leaf_node_embedding_count    = 1000
          leaf_nodes_to_search_percent = 10
        }
      }
    }
  }
  depends_on = [google_storage_bucket_object.product_embeddings_file]
}

# The index endpoint which allows the Cymbal Direct app to make queries
resource "google_vertex_ai_index_endpoint" "vector_search_index_endpoint" {
  project                 = var.project_id
  region                  = "us-central1"
  display_name            = "cymbal-direct-index-endpoint"
  public_endpoint_enabled = true
}

# Deploy the index onto the index endpoint
# Comment out for now because of the following error: Error: Cannot determine region: set in this resource, or set provider-level 'region' or 'zone'.
# For now, we'll need to manually deploy on Cloud console: https://console.cloud.google.com/vertex-ai/matching-engine/indexes
# resource "google_vertex_ai_index_endpoint_deployed_index" "vector_search_deployed_index" {
#   index = google_vertex_ai_index.vector_search_index.id
#   index_endpoint = google_vertex_ai_index_endpoint.vector_search_index_endpoint.id
#   deployed_index_id = "cymbal-direct-deployed-index"
#   display_name = "cymbal-direct-deployed-index"
#   enable_access_logging = false
#   dedicated_resources {
#     min_replica_count = 1
#     machine_spec {
#       machine_type = "e2-standard-2"
#     }
#   }
# }
