<?php
/**
 * AutoPostcode Integration
 *
 * @package  AutoPostcode Integration
 * @category Integration
 * @author   AutoPostcode
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! class_exists( 'WC_Autopostcode_Integration' ) ) :

class WC_Autopostcode_Integration extends WC_Integration {

	/**
	 * Init and hook in the integration.
	 */
	public function __construct() {
		global $woocommerce;

		$this->id					= 'autopostcodelookup';
		$this->method_title			= __( 'AutoPostcode Lookup', 'autopostcode' );

		// Load the settings.
		$this->init_form_fields();
		$this->init_settings();

		// Actions.
		add_action( 'woocommerce_update_options_integration_' .  $this->id, array( $this, 'process_admin_options' ) );

		add_action( 'woocommerce_checkout_billing', array( $this, 'addJsCssCheckout' ) );
		add_action( 'woocommerce_before_edit_account_address_form', array( $this, 'addJsCssCheckout' ) );

		if($this->get_option( 'active_shoporders' )){
			//Woocommerce Edit Shop Order
			add_action( 'admin_head', array( $this, 'addorderjs_admin_head' ));
		}

		// Filters.
		add_filter( 'woocommerce_settings_api_sanitized_fields_' . $this->id, array( $this, 'sanitize_settings' ) );
	}

	public function addJs($type, $dir) {

		$script_name = 'autopostcode-js-';
		wp_enqueue_script($script_name . $type, plugins_url( '../'.$dir.'/js/'.$type.'.js', __FILE__ ), '', '', array( 'strategy'  => 'defer' ));
		wp_add_inline_script(
			$script_name . $type,
			'autopostcode_settings = ' . json_encode($this->javascript_params()) . ';',
			'before'
		);

	}

	public function addorderjs_admin_head(){
		$this->addJs('autopostcode-shoporder', 'frontend');
	}

	public function addJsCSSCheckout(){
		$this->addJs('autopostcode-page-public', 'frontend');

		wp_enqueue_style('autopostcode-page-public', plugins_url( '../frontend/css/autopostcode-page-public.css', __FILE__ ));
	}

	public function javascript_params(){
		$js_params =  [
			'postcode' => [
				'active' 				=> $this->get_option( 'active_postcode' ),
				'secret_key'			=> $this->get_option( 'secret_key' ),
				'ajax_url'				=> admin_url( 'admin-ajax.php' )
			]
		];
		return $js_params;
	}

	/**
	 * Initialize integration settings form fields.
	 *
	 * @return void
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'active_postcode' => array(
				'title'			=> __( 'Active', 'autopostcode' ),
				'description'	=> __( 'Choose option to show postcode lookup on WC checkout page', 'autopostcode' ),
				'type'			=> 'select',
				'default'		=> 0,
				'class'			=> 'autopostcode',
				'id'			=> 'active_postcode',
				'desc_tip'		=> true,
				'options' => array(
					0			=> __('No', 'autopostcode' ),
					1			=> __('Yes', 'autopostcode' )
				)
			),

			'secret_key' => array(
				'title'			=> __( 'Secret Key', 'autopostcode' ),
				'description'	=> __( 'Enter the secret key from a AutoPostcode account.', 'autopostcode' ),
				'type'			=> 'text',
				'default'		=> 'xxxxx-xxxxx-xxxxx-xxxxx',
				'placeholder'	=> 'xxxxx-xxxxx-xxxxx-xxxxx',
				'id'			=> 'secret_key',
				'desc_tip'		=> true,
			),

			'active_shoporders' => array(
				'title'			=> __( 'Shop Orders (Backend)', 'autopostcode' ),
				'description'	=> __( 'Active postcode lookup on edit shop order admin page.', 'autopostcode' ),
				'type'			=> 'select',
				'default'		=> 0,
				'desc_tip'		=> true,
				'options' => array(
					0			=> __('No', 'autopostcode' ),
					1			=> __('Yes', 'autopostcode' )
				)
			),

			'find_secret_key' => array(
				'title'			=> __( 'Find My Secret Key', 'woocommerce' ),
				'description'	=> __( '<a target="_blank" href="https://app.autopostcode.com/">Click Here</a>', 'autopostcode' ),
				'type'			=> 'title',
				'id'			=> 'find_secret_key',
			),
		);
	}

	/**
	 * Santize our settings
	 * @see process_admin_options()
	 */
	public function sanitize_settings( $settings ) {
		if ( isset( $settings ) &&
			 isset( $settings['api_key'] ) ) {
			$settings['api_key'] = strtoupper( $settings['api_key'] );
		}
		return $settings;
	}

}

endif;
