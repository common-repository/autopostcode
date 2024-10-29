(function($) {
    'use strict';

    /**
     * All of the code for your public-facing JavaScript source
     * should reside in this file.
     *
     * Note: It has been assumed you will write jQuery code here, so the
     * $ function reference has been prepared for usage within the scope
     * of this function.
     *
     * This enables you to define handlers, for when the DOM is ready:
     *
     * $(function() {
     *
     * });
     *
     * When the window is loaded:
     *
     * $( window ).load(function() {
     *
     * });
     *
     * ...and/or other possibilities.
     *
     * Ideally, it is not considered best practise to attach more than a
     * single DOM-ready or window-load handler for a particular page.
     * Although scripts in the WordPress core, Plugins and Themes may be
     * practising this, we should strive to set a better example in our own work.
     */

    var auto_settings = autopostcode_settings;

    var auto_country = 'GB';

    function validate_pc (c) {
        var b = "";
        do {
            b = c;
            c = c.replace(/[^A-Za-z0-9]/, "");
        } while (b != c);
        b = c.toUpperCase();
        if (7 >= b.length && 5 <= b.length) {
            var d = b.substring(b.length - 3, b.length);
            var a = b.substring(0, b.length - 3);
            if (true == /[CIKMOV]/.test(d)) {
                return null;
            }
            if ("0" <= d.charAt(0) && "9" >= d.charAt(0) && "A" <= d.charAt(1) && "Z" >= d.charAt(1) && "A" <= d.charAt(2) && "Z" >= d.charAt(2)) {
                switch (a.length) {
                    case 2:
                        if ("A" <= a.charAt(0) && "Z" >= a.charAt(0) && "0" <= a.charAt(1) && "9" >= a.charAt(1)) {
                            return b;
                        }
                        break;
                    case 3:
                        if ("A" <= a.charAt(0) && "Z" >= a.charAt(0)) {
                            if ("0" <= a.charAt(1) && "9" >= a.charAt(1) && "0" <= a.charAt(2) && "9" >= a.charAt(2)) {
                                return b;
                            } else {
                                if ("A" <= a.charAt(1) && "Z" >= a.charAt(1) && "0" <= a.charAt(2) && "9" >= a.charAt(2)) {
                                    return b;
                                } else {
                                    if ("0" <= a.charAt(1) && "9" >= a.charAt(1) && "A" <= a.charAt(2) && "Z" >= a.charAt(2)) {
                                        return b;
                                    }
                                }
                            }
                        }
                        break;
                    case 4:
                        if ("A" <= a.charAt(0) && "Z" >= a.charAt(0) && "A" <= a.charAt(1) && "Z" >= a.charAt(1) && "0" <= a.charAt(2) && "9" >= a.charAt(2)) {
                            if ("0" <= a.charAt(3) && "9" >= a.charAt(3)) {
                                return b;
                            } else {
                                if ("A" <= a.charAt(3) && "Z" >= a.charAt(3)) {
                                    return b;
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return null;
    }

    function trimCommas(getAddress) {
        var trimmedAddress = getAddress.replace(/^,|,$|(,+)/g, function(m, g1) {
            return g1 ? ', ' : '';
        });

        return trimmedAddress;
    }

    function auto_wc_checkout_fields(shfield){
        //shfield = show/hide field
        //console.log(shfield);
        var wc_prf = ['billing', 'shipping'];
        for (var i = 0; i < wc_prf.length; i++) {
            jQuery('#' + wc_prf[i] + '_address_1_field').before(jQuery('#' + wc_prf[i] + '_postcode_search_field')).before(jQuery('#autopostcode_' + wc_prf[i] + '_button')).before(jQuery('.' + wc_prf[i] + '_auto_result_class'));
        }
        if (shfield && jQuery('#' + shfield + '_address_1').val() == '' && jQuery('#autopostcode_postcode_result_display_' + shfield).is(':empty')) {
            jQuery('.auto-hide-' + shfield).hide();
            jQuery('#' + shfield + '_cm_auto_manual').show();
        }
    }

    function add_find_btn(prefix){
        var brnhtml =
        jQuery('<p class="form-row form-row-wide address-field autopostcode_' + prefix + '" ' + 'id="' + prefix + '_postcode_search_field" style="position:relative;">' +
            //'<label for="' + prefix + '_postcode_search">' + 'Postcode Search' + '</label>' +
            '<input type="text" ' + 'class="input-text autosearchinput" ' + 'name="' + prefix + '_postcode_search" ' + 'id="' + prefix + '_postcode_search" ' + 'placeholder="Search for postcode">' +
                '<button class="button autofindbtn alt" ' + 'id="' + prefix + '_autobutton" ' + 'type="button"> Search Address </button>'+
        '</p>' +
        '<p class="form-row form-row-wide address-field ' + prefix + '_auto_result_class autopostcode_' + prefix + '" ' +
            'style="margin-bottom:0;">' +
            '<span id="autopostcode_postcode_result_display_' + prefix + '" style="float:left"></span>' +
        '</p>');

        return brnhtml;
    }

    function show_manual_text(prefix){

        var entermanual_btn = jQuery( '<p id="' + prefix + 'cm_auto_manual" class="auto_manual_text">'+ 'Enter Address Manually'+ '</p>');
        //entermanual_btn.css({display:'none'});
        entermanual_btn.insertAfter('#' + prefix + '_autobutton');
        entermanual_btn.on('click', function() {
            jQuery('.auto-hide-'+prefix).show(200);
            jQuery(this).hide(200);
        });

        jQuery('#' + prefix + '_city_field').addClass('auto-hide-' + prefix);
        jQuery('#' + prefix + '_address_1_field').addClass('auto-hide-' + prefix);
        jQuery('#' + prefix + '_address_2_field').addClass('auto-hide-' + prefix);
        jQuery('#' + prefix + '_state_field').addClass('auto-hide-' + prefix);
        jQuery('#' + prefix + '_postcode_field').addClass('auto-hide-' + prefix);

    }

    function auto_address_form(prefix) {

        if (jQuery('#' + prefix + '_address_1').length) {

            var auto_wc_country = jQuery('#' + prefix + '_country').val();

            if (auto_wc_country == auto_country || typeof auto_wc_country == 'undefined')
            {
                if (!jQuery('#' + prefix + '_autobutton').length) {

                    var addbtn_html = add_find_btn(prefix);

                    jQuery('#' + prefix + '_address_1').closest('p').before(addbtn_html);

                    jQuery('#' + prefix + '_autobutton').on('click', function() {

                        var postcodeinput = jQuery('#' + prefix + '_postcode_search').val();

                        if(postcodeinput != ''){

                            var searchpost= validate_pc(postcodeinput);

                            if (null != searchpost) {
                                jQuery('#' + prefix + '_postcode_search').addClass('auto_loader');

                                var parts = searchpost.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/);
                                parts.shift();
                                var lookcode = parts.join(' ');
                                var data = {
                                    'action': 'autopostcodeLookup',
                                    'field': lookcode,
                                    'secret_key': auto_settings.postcode.secret_key
                                }
                                // AJAX url
                                var auto_ajax_url = auto_settings.postcode.ajax_url;
                                jQuery.ajax({
                                    url: auto_ajax_url,
                                    type: 'post',
                                    data: data,
                                    dataType: 'json',
                                    success: function(response) {
                                        var resultObj = response;
                                        jQuery('#' + prefix + '_postcode_search').removeClass('auto_loader');
                                        if(resultObj.error_code){
                                           var error_code = resultObj.error_code;
                                            jQuery('#autopostcode_postcode_result_display_'+prefix).text(error_code);
                                        }

                                        var res_code = resultObj.code;
                                        var addressCount = resultObj.AddressCount;
                                        if (res_code == 200 && addressCount > 0) {

                                            jQuery('.'+prefix+"_auto_result_class span#autopostcode_postcode_result_display_"+prefix).html('<select id="auto_postcode_lookup_result_option"><option value="">Select Address</option></select>');
                                            for (var i = 0; i < addressCount; i++) {
                                                var building_number = resultObj.addresses[i].building_number;
                                                if (building_number == "0") {
                                                    building_number = "";
                                                }
                                                var building_name = resultObj.addresses[i].building_name;
                                                var sub_building_name = resultObj.addresses[i].sub_building_name;
                                                var organisation_name = resultObj.addresses[i].organisation_name;
                                                var department_name = resultObj.addresses[i].department_name;
                                                var dependent_locality = resultObj.addresses[i].dependent_locality;
                                                var thoroughfare_and_descriptor = resultObj.addresses[i].thoroughfare_and_descriptor;
                                                var post_town = resultObj.addresses[i].post_town;
                                                var postcode = resultObj.addresses[i].postcode;

                                                var address_result = organisation_name + "," + department_name + "," + sub_building_name + "," + building_name + "," + building_number + "," + thoroughfare_and_descriptor + "," + dependent_locality + "," + post_town + "," + postcode;

                                                var address_trim = address_result.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                                var s = address_trim;
                                                var full_address = s.replace(/^,|,$|(,+)/g, function(m, g1) {
                                                    return g1 ? ', ' : '';
                                                });

                                                var tr_str = "<option organisation_name = '" + organisation_name + "' department_name = '" + department_name + "' building_name = '" + building_name + "' sub_building_name = '" + sub_building_name + "' building_number = '" + building_number + "' dependent_locality = '" +
                                                dependent_locality + "' thoroughfare_and_descriptor  = '" + thoroughfare_and_descriptor + "' post_town = '" + post_town + "' post_code = '" + postcode + "' >" + full_address + "</option>";

                                                jQuery('.'+prefix+"_auto_result_class #auto_postcode_lookup_result_option").append(tr_str);
                                            }

                                        }

                                        if (res_code == 302) {
                                            jQuery('#autopostcode_postcode_result_display_'+prefix).text('Server connection failed, please enter your address manually.');
                                        }

                                        if (res_code == 401) {
                                            jQuery('#autopostcode_postcode_result_display_'+prefix).text('Server connection failed, please enter your address manually.');
                                        }

                                        if (res_code == 402 || res_code == 403) {
                                            jQuery('#autopostcode_postcode_result_display_'+prefix).text('Something went wrong, please enter your address manually.');
                                        }

                                        if (res_code == 200 && addressCount == 0) {
                                            jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').hide();
                                            jQuery('#autopostcode_postcode_result_display_'+prefix).text('Invalid postcode, please enter your address manually.');

                                            //jQuery('#'+prefix+'_company').val("");
                                            jQuery('#'+prefix+'_address_1').val("");
                                            jQuery('#'+prefix+'_address_2').val("");
                                            jQuery('#'+prefix+'_city').val("");
                                        }


                                        jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').change(function() {
                                            var org_name = '';
                                            var dep_name = '';

                                            var sel_org_name = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('organisation_name')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('organisation_name') : '';
                                            var sel_dep_name = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('department_name')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('department_name') : '';
                                            var sel_buil_no = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('building_number')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('building_number') : '';
                                            var sel_buil_name = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('building_name')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('building_name') : '';
                                            var sel_sub_buil_name = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('sub_building_name')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('sub_building_name') : '';
                                            var sel_dependent_locality = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('dependent_locality')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('dependent_locality') : '';
                                            var sel_thoroughfare_and_descriptor = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('thoroughfare_and_descriptor')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('thoroughfare_and_descriptor') : '';
                                            var sel_post_town = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('post_town')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('post_town') : '';
                                            var sel_postcode = (jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('post_code')) ? jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').find('option:selected').attr('post_code') : '';

                                            //jQuery("#"+prefix+"_company").val((sel_org_name + ", " + sel_dep_name).replace(/(^[,\s]+)|([,\s]+$)/g, ''));
                                            //if(prefix == 'shipping'){
                                                org_name = (sel_org_name).replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                                org_name = (org_name) ? org_name+' ' : '';
                                                dep_name = (sel_dep_name).replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                                dep_name = (dep_name) ? dep_name+' ' : '';
                                           // }

                                           if(sel_sub_buil_name != '' || sel_buil_name != ''){
                                                var cm_add1 = (sel_sub_buil_name) ? sel_sub_buil_name : sel_buil_name;
                                                if(org_name != '' || dep_name != ''){
                                                    jQuery("#"+prefix+"_address_1").val(org_name+dep_name+' '+cm_add1);
                                                    jQuery("#"+prefix+"_address_2").val(trimCommas((sel_buil_no + " " + sel_thoroughfare_and_descriptor+ " " + sel_dependent_locality)).replace(/(^[,\s]+)|([,\s]+$)/g, ''));
                                                } else {
                                                    jQuery("#"+prefix+"_address_1").val(cm_add1);
                                                    jQuery("#"+prefix+"_address_2").val(trimCommas((sel_buil_no + " " + sel_thoroughfare_and_descriptor + " " + sel_dependent_locality)).replace(/(^[,\s]+)|([,\s]+$)/g, ''));
                                                }
                                            } else {
                                                if(org_name != '' || dep_name != ''){
                                                    jQuery("#"+prefix+"_address_1").val(trimCommas((org_name+dep_name)).replace(/(^[,\s]+)|([,\s]+$)/g, ''));
                                                    jQuery("#"+prefix+"_address_2").val(sel_buil_no + " " + sel_thoroughfare_and_descriptor);
                                                } else {
                                                    jQuery("#"+prefix+"_address_1").val(trimCommas((sel_buil_no + " " + sel_thoroughfare_and_descriptor + " " + sel_dependent_locality)).replace(/(^[,\s]+)|([,\s]+$)/g, ''));
                                                    jQuery("#"+prefix+"_address_2").val(sel_dependent_locality);
                                                }

                                            }

                                            jQuery("#"+prefix+"_city").val(sel_post_town);
                                            jQuery("#"+prefix+"_postcode").val(sel_postcode);
                                            jQuery('.auto-hide-' + prefix).show(200);
                                            jQuery('.'+prefix+'_auto_result_class #auto_postcode_lookup_result_option').hide();
                                        });

                                    }
                                });

                            } else {
                                jQuery('#autopostcode_postcode_result_display_'+prefix).text('Invalid postcode, please enter your address manually.');
                            }
                        } else {
                            jQuery('#autopostcode_postcode_result_display_'+prefix).text('Invalid postcode, please enter your address manually.');
                        }
                    });

                    //Show Manually text
                    show_manual_text(prefix);
                }
                jQuery('.autopostcode_' + prefix).show();
                setTimeout(function() {
                    auto_wc_checkout_fields(prefix);
                }, 100);
            }
            else {
                jQuery('.autopostcode_' + prefix).hide();
                jQuery('.auto-hide-' + prefix).show();
                setTimeout(function() {
                    auto_wc_checkout_fields(false);
                }, 100);
            }
        }
    }



    //Check if Postcode enable
    if(auto_settings.postcode.active){

        auto_address_form('billing');
        auto_address_form('shipping');

        jQuery('#billing_country').on('change', function(event) {
            auto_address_form('billing');
        });
        jQuery('#shipping_country').on('change', function(event) {
            auto_address_form('shipping');
        });
    }

})(jQuery);