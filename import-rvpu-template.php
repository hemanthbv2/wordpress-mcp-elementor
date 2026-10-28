<?php
/**
 * 1-Click RV PU College Harohalli Homepage & Media Importer
 *
 * Usage:
 * 1. Upload this file, the `images/` directory, and `rvpu-homepage-elementor-template.json` to your WordPress root (or wp-content/).
 * 2. Open in your browser: https://your-site.com/import-rvpu-template.php
 * 3. It will:
 *    - Upload all 44 images into your WordPress Media Library.
 *    - Automatically update the Elementor template with your local attachment IDs and URLs.
 *    - Create the "RV PU College Harohalli - Homepage" page in Elementor canvas.
 *    - Save the template to Elementor's Saved Templates library.
 */

// Load WordPress environment
if ( file_exists( __DIR__ . '/wp-load.php' ) ) {
    require_once __DIR__ . '/wp-load.php';
} elseif ( file_exists( dirname( __DIR__ ) . '/wp-load.php' ) ) {
    require_once dirname( __DIR__ ) . '/wp-load.php';
} else {
    die( 'Error: Could not locate wp-load.php. Please place this script in your WordPress root directory.' );
}

// Ensure administrative context
if ( ! current_user_can( 'manage_options' ) ) {
    $admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
    if ( ! empty( $admins ) ) {
        wp_set_current_user( $admins[0]->ID );
    }
}

require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

$json_file  = __DIR__ . '/rvpu-homepage-elementor-template.json';
$images_dir = __DIR__ . '/images';

if ( ! file_exists( $json_file ) ) {
    die( 'Error: rvpu-homepage-elementor-template.json not found in ' . __DIR__ );
}

$template_content = file_get_contents( $json_file );
$template_data    = json_decode( $template_content, true );

if ( ! $template_data || empty( $template_data['content'] ) ) {
    die( 'Error: Invalid Elementor template JSON.' );
}

echo '<div style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:24px;border:1px solid #ddd;border-radius:12px;background:#fff;">';
echo '<h2>RV PU College Harohalli &mdash; 1-Click Template Importer</h2>';

$url_mapping = array();

// 1. Upload / Register all images in WordPress Media Library
if ( is_dir( $images_dir ) ) {
    $files      = scandir( $images_dir );
    $upload_dir = wp_upload_dir();

    echo '<h4>Step 1: Importing Images into Media Library</h4>';
    echo '<ul style="max-height:220px;overflow-y:auto;background:#f9f9f9;padding:12px 24px;border:1px solid #eee;border-radius:6px;">';

    foreach ( $files as $file ) {
        if ( in_array( $file, array( '.', '..' ) ) ) {
            continue;
        }
        $file_path = $images_dir . '/' . $file;
        if ( ! is_file( $file_path ) ) {
            continue;
        }

        // Check if an attachment with this filename already exists
        $existing = get_posts( array(
            'post_type'      => 'attachment',
            'meta_key'       => '_wp_attached_file',
            'meta_compare'   => 'LIKE',
            'meta_value'     => $file,
            'posts_per_page' => 1,
        ) );

        if ( ! empty( $existing ) ) {
            $attachment_id  = $existing[0]->ID;
            $attachment_url = wp_get_attachment_url( $attachment_id );
            echo '<li>Existing: <strong>' . esc_html( $file ) . '</strong> (ID: ' . $attachment_id . ')</li>';
        } else {
            $target_file = $upload_dir['path'] . '/' . $file;
            copy( $file_path, $target_file );

            $filetype   = wp_check_filetype( basename( $target_file ), null );
            $attachment = array(
                'guid'           => $upload_dir['url'] . '/' . basename( $target_file ),
                'post_mime_type' => $filetype['type'],
                'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $target_file ) ),
                'post_content'   => '',
                'post_status'    => 'inherit',
            );

            $attachment_id = wp_insert_attachment( $attachment, $target_file );
            $attach_data   = wp_generate_attachment_metadata( $attachment_id, $target_file );
            wp_update_attachment_metadata( $attachment_id, $attach_data );
            $attachment_url = wp_get_attachment_url( $attachment_id );
            echo '<li style="color:#0a7a3a;">+ Added: <strong>' . esc_html( $file ) . '</strong> (ID: ' . $attachment_id . ')</li>';
        }

        $url_mapping[ $file ] = array(
            'id'  => $attachment_id,
            'url' => $attachment_url,
        );
    }
    echo '</ul>';
}

// 2. Recursively replace image IDs and URLs in Elementor JSON
function rvpu_replace_media_recursive( &$elements, $url_mapping ) {
    foreach ( $elements as &$el ) {
        if ( isset( $el['settings'] ) && is_array( $el['settings'] ) ) {
            foreach ( $el['settings'] as $key => &$val ) {
                if ( is_array( $val ) && isset( $val['url'] ) ) {
                    $basename = basename( parse_url( $val['url'], PHP_URL_PATH ) );
                    if ( isset( $url_mapping[ $basename ] ) ) {
                        $val['url'] = $url_mapping[ $basename ]['url'];
                        if ( isset( $val['id'] ) ) {
                            $val['id'] = $url_mapping[ $basename ]['id'];
                        }
                    }
                }
            }
            if ( isset( $el['settings']['carousel'] ) && is_array( $el['settings']['carousel'] ) ) {
                foreach ( $el['settings']['carousel'] as &$item ) {
                    if ( isset( $item['url'] ) ) {
                        $basename = basename( parse_url( $item['url'], PHP_URL_PATH ) );
                        if ( isset( $url_mapping[ $basename ] ) ) {
                            $item['url'] = $url_mapping[ $basename ]['url'];
                            $item['id']  = $url_mapping[ $basename ]['id'];
                        }
                    }
                }
            }
            if ( isset( $el['settings']['html'] ) && is_string( $el['settings']['html'] ) ) {
                foreach ( $url_mapping as $fname => $info ) {
                    $el['settings']['html'] = preg_replace(
                        '#https?://[^"\']*/' . preg_quote( $fname, '#' ) . '#',
                        $info['url'],
                        $el['settings']['html']
                    );
                }
            }
        }
        if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
            rvpu_replace_media_recursive( $el['elements'], $url_mapping );
        }
    }
}

rvpu_replace_media_recursive( $template_data['content'], $url_mapping );

// 3. Create or Update Page in WordPress
$page_id = wp_insert_post( array(
    'post_type'   => 'page',
    'post_title'  => 'RV PU College Harohalli - Homepage',
    'post_status' => 'publish',
) );

update_post_meta( $page_id, '_wp_page_template', 'elementor_canvas' );
update_post_meta( $page_id, '_elementor_edit_mode', 'builder' );
update_post_meta( $page_id, '_elementor_template_type', 'wp-page' );
update_post_meta( $page_id, '_elementor_data', wp_slash( wp_json_encode( $template_data['content'] ) ) );

// 4. Save into Elementor Saved Templates Library
$template_post_id = wp_insert_post( array(
    'post_type'   => 'elementor_library',
    'post_title'  => 'RV PU College Harohalli - Homepage Template',
    'post_status' => 'publish',
) );

update_post_meta( $template_post_id, '_wp_page_template', 'elementor_canvas' );
update_post_meta( $template_post_id, '_elementor_edit_mode', 'builder' );
update_post_meta( $template_post_id, '_elementor_template_type', 'page' );
update_post_meta( $template_post_id, '_elementor_data', wp_slash( wp_json_encode( $template_data['content'] ) ) );
wp_set_object_terms( $template_post_id, 'page', 'elementor_library_type' );

if ( class_exists( '\Elementor\Plugin' ) ) {
    \Elementor\Plugin::$instance->files_manager->clear_cache();
}

$page_url = get_permalink( $page_id );
$edit_url = admin_url( "post.php?post={$page_id}&action=elementor" );

echo '<div style="background:#eaf8ef;padding:16px;border-radius:8px;border:1px solid #7cd699;margin-top:20px;">';
echo '<h3 style="color:#0e6b34;margin-top:0;">Import Complete!</h3>';
echo '<p>&bull; <strong>Live Page Created:</strong> <a href="' . esc_url( $page_url ) . '" target="_blank">' . esc_html( $page_url ) . '</a> (Page ID: ' . $page_id . ')</p>';
echo '<p>&bull; <strong>Edit with Elementor:</strong> <a href="' . esc_url( $edit_url ) . '" target="_blank">' . esc_html( $edit_url ) . '</a></p>';
echo '<p>&bull; <strong>Saved Template:</strong> Saved to your Elementor Templates Library as <em>"RV PU College Harohalli - Homepage Template"</em>.</p>';
echo '</div>';
echo '<p style="color:#888;font-size:12px;margin-top:20px;">For security, delete this script (<code>import-rvpu-template.php</code>) after running.</p>';
echo '</div>';
