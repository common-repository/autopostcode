<?php
/**
 * Plugin Name: AutoPostcode
 * Plugin URI: https://www.autopostcode.com/integrations/woocommerce/
 * Description: Adds an address dropdown list upon postcode entry on your WooCommerce checkout page.
 * Author: AutoPostcode
 * Author URI: https://www.autopostcode.com/
 * Version: 1.1
 * Requires at least: 5.6
 * Tested up to: 6.6.2
 * WC requires at least: 3.0
 * WC tested up to: 8.5.1
 * Text Domain: autopostcode
 * Copyright: © 2024 autopostcode.
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! class_exists( 'WC_Autopostcode' ) ) :

class WC_Autopostcode {

	/**
	* Construct the plugin.
	*/
	public function __construct() {
		add_action( 'plugins_loaded', array( $this, 'init' ) );
	}

	/**
	* Initialize the plugin.
	*/
	public function init() {

		// Checks if WooCommerce is installed.
		if ( class_exists( 'WC_Integration' ) ) {
			// Include our integration class.
			include_once 'includes/class-wc-autopostcode-integration.php';

			// Register the integration.
			add_filter( 'woocommerce_integrations', array( $this, 'woo_autopostcode_add_integration' ) );

		} else {
			// throw an admin error if you like
		}

		// Check WooCommerce Version
		add_action( 'admin_init', array( $this , 'wc_check') );

		// Add settings link on plugin page
		add_filter('plugin_action_links_'.plugin_basename(__FILE__), array( $this ,'auto_add_plugin_page_settings_link') );

		// WooCommerce Checkout ajax request
		add_action( 'wp_ajax_autopostcodeLookup', array( $this , 'autopostcodeLookup') );
		add_action( 'wp_ajax_nopriv_autopostcodeLookup', array( $this , 'autopostcodeLookup') );

	}

	/**
	 * Add a new integration to WooCommerce.
	 */
	public function woo_autopostcode_add_integration( $integrations ) {
		$integrations[] = 'WC_Autopostcode_Integration';
		return $integrations;
	}

	/**
	 * Register the init on the admin area.
	 *
	 * @since    1.0.0
	 */
	public function wc_check(){

		// Check WooCommerce plugin active
		if ( ! class_exists( 'woocommerce' ) ) {

			// Show notification on admin side
			add_action( 'admin_notices',  array( $this, 'woo_plug_admin_notice') );

		}

	}

	/**
	 * Register the notification for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function woo_plug_admin_notice(){

		$class = 'notice notice-error';
		$message = __( 'WooCommerce is necessary for the AutoPostcode Lookup plugin, please install WooCommerce now!', 'woocommerce' );

		printf( '<div class="%1$s"><p>%2$s</p></div>', esc_attr( $class ), esc_html( $message ) );

	}

	/*
	 * Register setting link on plugin page.
	 *
	 * @since    1.0.0
	*/
	public function auto_add_plugin_page_settings_link($links){

		$links[] = '<a href="' . admin_url( 'admin.php?page=wc-settings&tab=integration&section=autopostcodelookup' ) . '">' . __('Settings') . '</a>';

		return $links;
	}

	/*
	 * Request API call
	 *
	 * @since    1.0.0
	*/
	public function autopostcodeLookup() {

		$secret_key = sanitize_text_field($_REQUEST['secret_key']);
		$post_code = sanitize_text_field($_REQUEST['field']);
		$responseArr = array();
		$domainname = get_site_url();
		$serveraddress = ($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
		if($secret_key != '' && $post_code != ''){
			$lookUpResponse = wp_remote_post("https://app.autopostcode.com/api/search", array(
					'method' => 'POST',
					'timeout' => 45,
					'redirection' => 5,
					'httpversion' => '1.0',
					'blocking' => true,
					'headers' => array(
						'token' => $secret_key,
						'domain' => $domainname,
						'ip' => $serveraddress
					),
					'body' => array(
						'postcode' => $post_code,
					)
				)
			);

			if (is_wp_error($lookUpResponse)) {
				$responseArr = array('error_code' => 'Enter postcode is not found, please enter your address manually.' , 'error_message' => $lookUpResponse->get_error_message());
			} else {
				$responseBody = $lookUpResponse['body'];
				$responseArr = json_decode($responseBody);
			}


			wp_die(json_encode($responseArr));
		} else {
			$responseArr = array('error_code' => 'Something went wrong, please enter your address manually.');
			wp_die(json_encode($responseArr));
		}
	}

}

$WC_Autopostcode_Integration = new WC_Autopostcode( __FILE__ );

endif;
