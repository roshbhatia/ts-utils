#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_version="$(jq -r '.version' "${repo_root}/package.json")"
expected_tag="v${package_version}"

if [[ ${GITHUB_REF_NAME:-} != "${expected_tag}" ]]; then
  echo "ERROR: release tag ${GITHUB_REF_NAME:-<unset>} does not match ${expected_tag}" >&2
  exit 1
fi
