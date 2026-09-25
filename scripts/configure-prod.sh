#!/usr/bin/env bash
#
# Configure the prod secret for northgate-website-poc, in one run.
#
#   ./scripts/configure-prod.sh <api-username> <api-password> [webhook-url]
#
# Mints the API credential hashes, patches the Kubernetes secret, restarts the
# deployment so envFrom picks the new keys up, and verifies the result with a
# real request rather than assuming it worked.
#
# The plaintext password never leaves this machine: only the scrypt hash is
# sent to the cluster. The webhook URL is optional — pass it when you have one.
#
# Written because an assistant is not permitted to write secret stores, which
# is the right rule. This keeps the human in the loop for exactly that step
# without making them reassemble the commands by hand.
set -euo pipefail

NODE_HOST="${NODE_HOST:-root@213.199.53.163}"
NAMESPACE="${NAMESPACE:-shielva}"
SECRET="${SECRET:-northgate-poc-gate}"
DEPLOY="${DEPLOY:-northgate-website-poc}"
SITE="${SITE:-https://northgate-website-poc.shielva.ai}"

API_USER="${1:-}"
API_PASSWORD="${2:-}"
WEBHOOK_URL="${3:-}"

if [[ -z "$API_USER" || -z "$API_PASSWORD" ]]; then
    echo "usage: $0 <api-username> <api-password> [webhook-url]" >&2
    exit 1
fi

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> minting hashes locally (the password itself is never sent)"
mint="$(node "$here/mint-api-credentials.mjs" "$API_USER" "$API_PASSWORD")"
user_hash="$(grep '^FEEDBACK_API_USER_SHA256=' <<<"$mint" | cut -d= -f2-)"
pass_hash="$(grep '^FEEDBACK_API_PASSWORD_HASH=' <<<"$mint" | cut -d= -f2-)"

# Build the patch as JSON with jq so a hash or URL containing an awkward
# character cannot break out of the quoting.
if [[ -n "$WEBHOOK_URL" ]]; then
    patch="$(jq -nc \
        --arg u "$user_hash" --arg p "$pass_hash" --arg w "$WEBHOOK_URL" \
        '{stringData:{FEEDBACK_API_USER_SHA256:$u,FEEDBACK_API_PASSWORD_HASH:$p,ENQUIRY_WEBHOOK_URL:$w,FEEDBACK_WEBHOOK_URL:$w}}')"
    echo "==> will set: API credentials + enquiry and feedback webhooks"
else
    patch="$(jq -nc \
        --arg u "$user_hash" --arg p "$pass_hash" \
        '{stringData:{FEEDBACK_API_USER_SHA256:$u,FEEDBACK_API_PASSWORD_HASH:$p}}')"
    echo "==> will set: API credentials only (no webhook URL given)"
fi

echo "==> patching $SECRET and restarting $DEPLOY"
ssh -o BatchMode=yes "$NODE_HOST" \
    "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
     kubectl -n '$NAMESPACE' patch secret '$SECRET' --type merge -p '$patch'
     kubectl -n '$NAMESPACE' rollout restart deploy/'$DEPLOY'
     kubectl -n '$NAMESPACE' rollout status deploy/'$DEPLOY' --timeout=180s"

echo "==> verifying with a real request"
code="$(curl -s -o /dev/null -w '%{http_code}' -u "$API_USER:$API_PASSWORD" "$SITE/api/submissions")"
case "$code" in
    200) echo "OK — the API answered 200. Read submissions with:"
         echo "     curl -u '$API_USER:<password>' $SITE/api/submissions" ;;
    401) echo "FAILED — 401. The hashes are in the secret but do not match this password." >&2; exit 1 ;;
    503) echo "FAILED — 503. The pod has not picked up the new keys; check the restart." >&2; exit 1 ;;
    *)   echo "UNEXPECTED — HTTP $code." >&2; exit 1 ;;
esac
