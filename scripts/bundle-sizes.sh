#!/bin/bash

# Function to compute bundle size for a package
function compute_bundle_size() {
    local package_path="${1}"
    local dist_path="${package_path}/dist"

    if [[ ! -d "${dist_path}" ]]; then
        echo "0"
        return
    fi

    # Calculate total size of relevant files in dist directory
    local total_size=0

    # Include all files except source maps, TypeScript build info, and declaration maps
    while IFS= read -r -d '' file; do
        if [[ -f "${file}" ]]; then
            # Skip certain file types that aren't part of the actual bundle
            if [[ ! "${file}" =~ \.(map|tsbuildinfo|d\.ts\.map)$ ]]; then
                local file_size=$(gzip -c "${file}" | wc -c)
                total_size=$((total_size + file_size))
            fi
        fi
    done < <(find "${dist_path}" -type f -print0)

    echo "${total_size}"
}

# Function to get all package paths from workspace
function get_package_paths() {
    local packages=()

    # Find all package.json files in packages directory
    while IFS= read -r -d '' package_json; do
        local package_dir=$(dirname "${package_json}")
        if [[ -f "${package_dir}/package.json" ]]; then
            packages+=("${package_dir}")
        fi
    done < <(find packages -name "package.json" -type f -print0)

    printf '%s\n' "${packages[@]}"
}

# Function to get package name from package.json
function get_package_name() {
    local package_path="${1}"
    local package_json="${package_path}/package.json"

    if [[ -f "${package_json}" ]]; then
        # Extract name field from package.json
        node -p "require('./${package_json}').name" 2>/dev/null || basename "${package_path}"
    else
        basename "${package_path}"
    fi
}

# Function to load previous sizes from file
function load_previous_sizes() {
    local prev_file="${1:-previous_sizes.json}"

    if [[ -f "${prev_file}" ]]; then
        cat "${prev_file}"
    else
        echo "{}"
    fi
}

# Function to save current sizes to file
function save_current_sizes() {
    local sizes_json="${1}"
    local output_file="${2:-previous_sizes.json}"

    echo "${sizes_json}" > "${output_file}"
}

# Main function
function main() {
    local previous_sizes_file="${1:-previous_sizes.json}"
    local output_file="${2:-bundle_size_report.md}"

    # Load previous sizes
    local previous_sizes=$(load_previous_sizes "${previous_sizes_file}")

    # Initialize output with better formatting
    local output="## 📦 Bundle Size Analysis\n\n"

    # Group packages by size change significance
    local significant_changes=""
    local minor_changes=""
    local no_changes=""
    local new_packages=""

    # JSON object to store current sizes
    local current_sizes="{}"

    # Get all package paths
    local package_paths=($(get_package_paths))

    if [[ ${#package_paths[@]} -eq 0 ]]; then
        echo "No packages found in workspace"
        exit 1
    fi

    # Process each package
    for package_path in "${package_paths[@]}"; do
        local package_name=$(get_package_name "${package_path}")
        local current_size=$(compute_bundle_size "${package_path}")

        # Get previous size from JSON
        local previous_size=$(echo "${previous_sizes}" | node -p "
            try {
                const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
                data['${package_name}'] || 0;
            } catch (e) {
                0;
            }
        " 2>/dev/null || echo "0")

        # Calculate difference
        local diff=$((current_size - previous_size))
        local diff_pct="0"

        if [[ "${previous_size}" -gt 0 ]]; then
            diff_pct=$(awk "BEGIN { printf \"%.1f\", (${diff} / ${previous_size}) * 100 }")
        fi

        # Format sizes in KB with proper alignment
        local current_kb=$(awk "BEGIN { printf \"%.1f\", ${current_size} / 1000 }")
        local previous_kb=$(awk "BEGIN { printf \"%.1f\", ${previous_size} / 1000 }")
        local diff_kb=$(awk "BEGIN { printf \"%.1f\", ${diff} / 1000 }")

        # Calculate percentage for categorization
        local abs_diff_pct=$(awk "BEGIN { printf \"%.1f\", ${diff_pct} < 0 ? -${diff_pct} : ${diff_pct} }")

        # Create package entry
        local package_entry=""

        if [[ "${previous_size}" -eq 0 ]]; then
            # New package
            package_entry="🆕 **${package_name}** - ${current_kb} KB *(new)*"
            new_packages+="\n${package_entry}"
        elif [[ $(awk "BEGIN { print (${abs_diff_pct} >= 5.0) }") -eq 1 ]] || [[ $(awk "BEGIN { print (${diff} >= 1000 || ${diff} <= -1000) }") -eq 1 ]]; then
            # Significant change (>5% or >1KB)
            if [[ "${diff}" -gt 0 ]]; then
                package_entry="🔺 **${package_name}** - ${current_kb} KB *(+${diff_kb} KB, +${diff_pct}%)*"
            else
                package_entry="🔻 **${package_name}** - ${current_kb} KB *(${diff_kb} KB, ${diff_pct}%)*"
            fi
            significant_changes+="\n${package_entry}"
        elif [[ "${diff}" -ne 0 ]]; then
            # Minor change
            if [[ "${diff}" -gt 0 ]]; then
                package_entry="📈 **${package_name}** - ${current_kb} KB *(+${diff_kb} KB)*"
            else
                package_entry="📉 **${package_name}** - ${current_kb} KB *(${diff_kb} KB)*"
            fi
            minor_changes+="\n${package_entry}"
        else
            # No change
            package_entry="➖ **${package_name}** - ${current_kb} KB"
            no_changes+="\n${package_entry}"
        fi

        # Store current size in JSON
        current_sizes=$(echo "${current_sizes}" | node -p "
            const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
            data['${package_name}'] = ${current_size};
            JSON.stringify(data, null, 2);
        ")
    done

    # Build the final output with sections
    if [[ -n "${significant_changes}" ]]; then
        output+="\n### 🚨 Significant Changes\n${significant_changes}\n"
    fi

    if [[ -n "${new_packages}" ]]; then
        output+="\n### 🆕 New Packages\n${new_packages}\n"
    fi

    if [[ -n "${minor_changes}" ]]; then
        output+="\n<details>\n<summary>📊 Minor Changes</summary>\n${minor_changes}\n</details>\n"
    fi

    if [[ -n "${no_changes}" ]]; then
        output+="\n<details>\n<summary>➖ No Changes</summary>\n${no_changes}\n</details>\n"
    fi

    # Add summary
    local total_packages=${#package_paths[@]}
    output+="\n---\n**${total_packages} packages analyzed** • Baseline from latest \`main\` build"

    # Write report
    echo -e "${output}" > "${output_file}"

    # Also write to stats.txt for CI compatibility
    echo -e "${output}" > "stats.txt"

    # Save current sizes for next run
    save_current_sizes "${current_sizes}" "${previous_sizes_file}"

    # Output stats for GitHub Actions
    echo "stats<<EOF" >> $GITHUB_OUTPUT
    echo -e "${output}" >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT

    echo "Bundle size report generated: ${output_file}"
    echo "Current sizes saved to: ${previous_sizes_file}"
}

# Run the script
main "$@"
