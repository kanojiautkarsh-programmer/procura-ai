#!/bin/bash
# Run once to create R2 bucket + configure public access
# Requires: wrangler CLI (`npm i -g wrangler`), logged in via `wrangler login`

set -e

BUCKET_NAME="procura-invoices"

echo "Creating R2 bucket: $BUCKET_NAME"
wrangler r2 bucket create "$BUCKET_NAME"

echo "Bucket created successfully."
echo ""
echo "To make the bucket publicly readable (needed for invoice URLs):"
echo "  1. Go to https://dash.cloudflare.com > R2 > $BUCKET_NAME > Settings"
echo "  2. Enable 'Public Access' and note the public URL"
echo ""
echo "Then copy that URL to:"
echo "  - apps/web/wrangler.toml → vars.R2_PUBLIC_URL"
echo "  - Cloudflare Pages env vars → R2_PUBLIC_URL"
echo ""
echo "To create KV namespace for caching:"
echo "  wrangler kv namespace create procura-cache"
echo "  # Copy the ID into apps/web/wrangler.toml → kv_namespaces[].id"
